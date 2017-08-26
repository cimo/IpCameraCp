<?php
require_once("Utility.php");
require_once("Query.php");
require_once("Ajax.php");
require_once("TableAndPagination.php");

class IpCamera {
    // Vars
    private $response;
    
    private $utility;
    private $query;
    private $ajax;
    private $tableAndPagination;
    
    private $videoUrl;
    private $controlUrl;
    
    private $resolution;
    private $rate;
    
    private $settingRow;
    
    // Properties
    public function getVideoUrl() {
        return $this->videoUrl;
    }
    
    public function getControlUrl() {
        return $this->controlUrl;
    }
    
    // Functions public
    public function __construct() {
        $this->response = Array();
        
        $this->utility = new Utility();
        $this->query = new Query($this->utility->getDatabase());
        $this->ajax = new Ajax();
        $this->tableAndPagination = new TableAndPagination();
        
        $this->settingRow = $this->query->selectSettingDatabase();
        
        $_SESSION['camera_number'] = isset($_SESSION['camera_number']) == true ? $_SESSION['camera_number'] : 1;
        
        $cameraRow = $this->query->selectCameraDatabase($_SESSION['camera_number']);
        
        $deviceRow = $this->query->selectDeviceDatabase($cameraRow['device_id']);
        
        $this->videoUrl = "{$cameraRow['video_url']}/{$deviceRow['video']}user={$cameraRow['username']}&pwd={$cameraRow['password']}&resolution=$this->resolution&rate=$this->rate";
        $this->controlUrl = "{$cameraRow['video_url']}/decoder_control.cgi?user={$cameraRow['username']}&pwd={$cameraRow['password']}";
        
        $this->resolution = 32;
        $this->rate = 0;
    }
    
    public function phpInput() {
        $this->utility->checkSessionOverTime();
        
        $content = file_get_contents("php://input");
        $json = json_decode($content);

        if ($json != null) {
            if (isset($_GET['controller']) == true) {
                $token = is_array($json) == true ? end($json)->value : $json->token;

                if ($this->utility->checkToken($token) == true) {
                    $parameters = $this->utility->requestParametersParse($json);
                    
                    if ($_GET['controller'] == "selectionAction")
                        $this->selectionAction($parameters);
                    else if ($_GET['controller'] == "profileAction")
                        $this->profileAction($parameters);
                    else if ($_GET['controller'] == "deleteAction")
                        $this->deleteAction();
                    else if ($_GET['controller'] == "controlsAction")
                        $this->controlsAction($parameters);
                    else if ($_GET['controller'] == "filesAction")
                        $this->filesAction($parameters);
                    else if ($_GET['controller'] == "settingsAction")
                        $this->settingsAction($parameters);
                }
            }
        }
        else if (isset($_POST['searchWritten']) == true && isset($_POST['paginationCurrent']) == true)
            $this->filesList();
        else
            $this->response['messages']['error'] = "Json error!";
        
        echo $this->ajax->response(Array(
            'response' => $this->response
        ));
        
        $this->utility->getDatabase()->close();
    }
    
    public function generateSelectOptionFromMotionFolders() {
        $motionFolderPath = "{$_SERVER['DOCUMENT_ROOT']}/motion";
        
        $scanDirElements = @scandir($motionFolderPath, 1);
        
        if ($scanDirElements != false) {
            asort($scanDirElements);
            
            $count = 0;
            
            foreach ($scanDirElements as $key => $value) {
                if ($value != "." && $value != ".." && $value != ".htaccess" && is_dir("$motionFolderPath/$value") == true) {
                    $count ++;
                    
                    echo "<option value=\"$count\">Camera $count</option>";
                }
            }
        }
    }
    
    public function filesList() {
        $motionFolderPath = "{$_SERVER['DOCUMENT_ROOT']}/motion/camera_{$_SESSION['camera_number']}";
        
        $scanDirElements = @scandir($motionFolderPath);
        
        if ($scanDirElements == true) {
            if ($scanDirElements[0] == ".") {
                unset($scanDirElements[0]);
                unset($scanDirElements[1]);
                
                $index = array_search("lastsnap.jpg", $scanDirElements);
                unset($scanDirElements[$index]);
            }
            
            $tableAndPagination = $this->tableAndPagination->request($scanDirElements, 5, "file", true, false);
            
            $count = 0;
            $list = "";
            
            foreach ($tableAndPagination['list'] as $key => $value) {
                $count ++;
                
                $list .= "<tr>
                    <td>
                        $count
                    </td>
                    <td class=\"name_column\">
                        $value
                    </td>
                    <td>
                        {$this->utility->sizeUnits(filesize("$motionFolderPath/$value"))}
                    </td>
                    <td class=\"horizontal_center\">
                        <button class=\"camera_files_download button_custom\"><i class=\"fa fa-download\"></i></button>
                    </td>
                    <td class=\"horizontal_center\">
                        <button class=\"camera_files_delete button_custom_danger\"><i class=\"fa fa-remove\"></i></button>
                    </td>
                </tr>";
            }
            
            $this->response['values']['search'] = $tableAndPagination['search'];
            $this->response['values']['pagination'] = $tableAndPagination['pagination'];
            $this->response['values']['list'] = $list;
            
            return Array(
                'search' => $this->response['values']['search'],
                'pagination' => $this->response['values']['pagination'],
                'list' => $this->response['values']['list']
            );
        }
        
        return Array(
            Array(
                'search' => ""
            ),
            Array(
                'pagination' => ""
            ),
            Array(
                'list' => ""
            )
        );
    }
    
    // Functions private
    private function curlCommandsUrls($url) {
        $response = "";
        
        $curl = curl_init();
        
        curl_setopt($curl, CURLOPT_URL, $url);
        curl_setopt($curl, CURLOPT_HEADER, 0);
        curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
        
        $response = curl_exec($curl);
        
        curl_close($curl);
        
        return $response;
    }
    
    private function profileConfig($deviceId, $videoUrl, $username, $password, $threshold, $motionDetectionStatus) {
        @mkdir("{$_SERVER['DOCUMENT_ROOT']}/motion/camera_{$_SESSION['camera_number']}");
        @chmod("{$_SERVER['DOCUMENT_ROOT']}/motion/camera_{$_SESSION['camera_number']}", 0777);
        
        $deviceRow = $this->query->selectDeviceDatabase($deviceId);
        
        $content = "framerate 30\n";
        $content .= "netcam_url $videoUrl/{$deviceRow['video']}user=$username&pwd=$password&resolution=$this->resolution\n";
        $content .= "netcam_userpass $username:$password\n";
        $content .= "threshold $threshold\n";
        
        if ($this->settingRow['motion_version'] === "3.1.12") {
            $content .= "netcam_http 1.0\n";
            $content .= "ffmpeg_cap_new on\n";
            $content .= "output_normal off\n";
        }
        else if ($this->settingRow['motion_version'] === "4.0.1") {
            $content .= "ffmpeg_output_movies on\n";
            $content .= "output_debug_pictures off\n";
        }
        
        $content .= "target_dir {$_SERVER['DOCUMENT_ROOT']}/motion/camera_{$_SESSION['camera_number']}";
        
        file_put_contents("{$_SERVER['DOCUMENT_ROOT']}/motion/camera_{$_SESSION['camera_number']}.conf", $content.PHP_EOL);
        
        $this->curlCommandsUrls("{$this->settingRow['server_url']}/{$_SESSION['camera_number']}/config/set?target_dir={$_SERVER['DOCUMENT_ROOT']}/motion/camera_{$_SESSION['camera_number']}");
        $this->curlCommandsUrls("{$this->settingRow['server_url']}/{$_SESSION['camera_number']}/config/set?framerate=30");
        $this->curlCommandsUrls("{$this->settingRow['server_url']}/{$_SESSION['camera_number']}/config/set?netcam_url=$videoUrl/{$deviceRow['video']}user=$username&pwd=$password&resolution=$this->resolution");
        $this->curlCommandsUrls("{$this->settingRow['server_url']}/{$_SESSION['camera_number']}/config/set?netcam_userpass=$username:$password");
        $this->curlCommandsUrls("{$this->settingRow['server_url']}/{$_SESSION['camera_number']}/config/set?threshold=$threshold");
        
        if ($this->settingRow['motion_version'] === "3.1.12") {
            $this->curlCommandsUrls("{$this->settingRow['server_url']}/{$_SESSION['camera_number']}/config/set?netcam_http=1.0");
            $this->curlCommandsUrls("{$this->settingRow['server_url']}/{$_SESSION['camera_number']}/config/set?ffmpeg_cap_new=on");
            $this->curlCommandsUrls("{$this->settingRow['server_url']}/{$_SESSION['camera_number']}/config/set?output_normal=off");
        }
        else if ($this->settingRow['motion_version'] === "4.0.1") {
            $this->curlCommandsUrls("{$this->settingRow['server_url']}/{$_SESSION['camera_number']}/config/set?ffmpeg_output_movies=on");
            $this->curlCommandsUrls("{$this->settingRow['server_url']}/{$_SESSION['camera_number']}/config/set?output_debug_pictures=off");
        }
        
        $this->curlCommandsUrls("{$this->settingRow['server_url']}/{$_SESSION['camera_number']}/detection/$motionDetectionStatus");
    }
    
    // Controllers
    private function selectionAction($parameters) {
        if (isset($parameters['cameraNumber']) == false)
            return;
        
        if ($parameters['cameraNumber'] == 0) {
            $cameraRows = $this->query->selectAllCamerasDatabase();
            
            $lastCamera = end($cameraRows);
            $_SESSION['camera_number'] = $lastCamera['camera_number'] + 1;
            
            $query = $this->utility->getDatabase()->getPdo()->prepare("INSERT INTO cameras (
                                                                            camera_number,
                                                                            device_id,
                                                                            video_url,
                                                                            username,
                                                                            password,
                                                                            threshold,
                                                                            motion_detection_status
                                                                        )
                                                                        VALUES (
                                                                            :cameraNumber,
                                                                            :deviceId,
                                                                            :videoUrl,
                                                                            :username,
                                                                            :password,
                                                                            :threshold,
                                                                            :motionDetectionStatus
                                                                        );");
            
            $query->bindValue(":cameraNumber", $_SESSION['camera_number']);
            $query->bindValue(":deviceId", "");
            $query->bindValue(":videoUrl", "");
            $query->bindValue(":username", "");
            $query->bindValue(":password", "");
            $query->bindValue(":threshold", "");
            $query->bindValue(":motionDetectionStatus", "pause");
            
            $query->execute();
            
            $this->utility->searchInFile("/etc/motion/motion.conf", "thread {$_SERVER['DOCUMENT_ROOT']}/motion/camera_{$_SESSION['camera_number']}.conf", null);
            
            $this->profileConfig("", "", "", "", "", "pause");
            
            $this->response['messages']['success'] = "New camera created with success.";
        }
        else if ($parameters['cameraNumber'] > 0) {
            $_SESSION['camera_number'] = $parameters['cameraNumber'];
            
            $motionDetectionStatus = "pause";
            
            $status = $this->curlCommandsUrls("{$this->settingRow['server_url']}/{$_SESSION['camera_number']}/detection/status");
            
            if (strpos($status, "Detection status PAUSE") === false)
                $motionDetectionStatus = "start";
            
            $this->response['values']['motionDetectionStatus'] = $motionDetectionStatus;
        }
    }
    
    private function profileAction($parameters) {
        $this->profileConfig($parameters['deviceId'], $parameters['videoUrl'], $parameters['username'], $parameters['password'], $parameters['threshold'], $parameters['motionDetectionStatus']);
        
        $query = $this->utility->getDatabase()->getPdo()->prepare("UPDATE cameras
                                                                    SET device_id = :deviceId,
                                                                        video_url = :videoUrl,
                                                                        username = :username,
                                                                        password = :password,
                                                                        threshold = :threshold,
                                                                        motion_detection_status = :motionDetectionStatus
                                                                    WHERE camera_number = :cameraNumber");
        
        $query->bindValue(":deviceId", $parameters['deviceId']);
        $query->bindValue(":videoUrl", $parameters['videoUrl']);
        $query->bindValue(":username", $parameters['username']);
        $query->bindValue(":password", $parameters['password']);
        $query->bindValue(":threshold", $parameters['threshold']);
        $query->bindValue(":motionDetectionStatus", $parameters['motionDetectionStatus']);
        $query->bindValue(":cameraNumber", $_SESSION['camera_number']);
        
        $query->execute();
        
        $this->curlCommandsUrls("{$this->settingRow['server_url']}/{$_SESSION['camera_number']}/action/restart");
        
        $this->response['messages']['success'] = "Profile updated with success.";
    }
    
    private function deleteAction() {
        $this->utility->removeDirRecursive("{$_SERVER['DOCUMENT_ROOT']}/motion/camera_{$_SESSION['camera_number']}", true);
        
        unlink("{$_SERVER['DOCUMENT_ROOT']}/motion/camera_{$_SESSION['camera_number']}.conf");
        
        $this->utility->searchInFile("/etc/motion/motion.conf", "thread {$_SERVER['DOCUMENT_ROOT']}/motion/camera_{$_SESSION['camera_number']}.conf", " ");
        
        $query = $this->utility->getDatabase()->getPdo()->prepare("DELETE FROM cameras
                                                                    WHERE camera_number = :cameraNumber");
        
        $query->bindValue(":cameraNumber", $_SESSION['camera_number']);
        
        $query->execute();
        
        $this->curlCommandsUrls("{$this->settingRow['server_url']}/{$_SESSION['camera_number']}/action/quit");
        
        $_SESSION['camera_number'] = -1;
        
        $this->response['messages']['success'] = "Camera deleted with success!";
    }
    
    private function controlsAction($parameters) {
        if ($parameters['event'] == "picture") {
            $this->curlCommandsUrls("{$this->settingRow['server_url']}/{$_SESSION['camera_number']}/action/snapshot");
            
            $this->response['messages']['success'] = "Picture taked.";
        }
    }
    
    private function filesAction($parameters) {
        if ($parameters['event'] == "delete") {
            $path = "{$_SERVER['DOCUMENT_ROOT']}/motion/camera_{$_SESSION['camera_number']}/" . trim($parameters['name']);
            
            if (file_exists($path) == true)
                unlink($path);
            
            $this->response['messages']['success'] = "File deleted with success!";
        }
        else if ($parameters['event'] == "deleteAll") {
            $path = "{$_SERVER['DOCUMENT_ROOT']}/motion/camera_{$_SESSION['camera_number']}/";
            
            $this->utility->removeDirRecursive($path, false);
            
            $this->response['messages']['success'] = "All files deleted with success!";
        }
        
        $this->filesList();
    }
    
    private function settingsAction($parameters) {
        $query = $this->utility->getDatabase()->getPdo()->prepare("UPDATE settings
                                                                    SET template = :template,
                                                                        server_url = :serverUrl,
                                                                        motion_version = :motionVersion
                                                                    WHERE id = :id");
        
        $query->bindValue(":template", $parameters['template']);
        $query->bindValue(":serverUrl", $parameters['serverUrl']);
        $query->bindValue(":motionVersion", $parameters['motionVersion']);
        $query->bindValue(":id", 1);
        
        $query->execute();
        
        $this->response['messages']['success'] = "Settings updated with success.";
    }
}