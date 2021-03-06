"use strict";

/* global materialDesign, mdc */

class Helper {
    // Properties
    get getTouchMove() {
        return this.touchMove;
    }
    
    // Functions public
    constructor() {
        this.touchMove = false;
    }
    
    linkPreventDefault = () => {
        $("a[href^='#']").on("click", "", (event) => {
            event.preventDefault();
        });
    }
    
    mutationObserver = (type, element, callback) => {
        let observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if ($.inArray(mutation.type, type) !== -1)
                    callback();
            });
        });
        
        observer.observe(element, {'attributes': true, 'childList': true, 'subtree': true, 'characterData': true});
    }
    
    checkMobile = () => {
        let isMobile = false;
        
        let navigatorUserAgent = navigator.userAgent.toLowerCase();
        
        if (/(android|ipad|iphone|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(navigatorUserAgent)
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigatorUserAgent.substr(0, 4))) {
            
            isMobile = true;
        }

        return isMobile;
    }
    
    checkWidthType = (maxWidthOverride) => {
        let widthType = "";
        
        let widthTmp = maxWidthOverride === undefined ? window.setting.widthMobile : maxWidthOverride;
        
        if (window.matchMedia(`(max-width: ${widthTmp}px)`).matches === true)
            widthType = "mobile";
        else
            widthType = "desktop";
        
        return widthType;
    }
    
    postIframe = (action, method, elements) => {
        let time = (new Date()).getTime();

        let iframeTag = `iframe_commands_${time}`;
        
        $("<iframe>", {
            'id': iframeTag,
            'name': iframeTag,
            'style': "display: none;"
        }).appendTo("body");
        
        let formTag = `form_commands_${time}`;
        
        $("<form>", {
            'id': formTag,
            'target': iframeTag,
            'action': action,
            'method': method
        }).appendTo("body");
        
        $.each(elements, (key, value) => {
            $("<input>", {
                'type': "hidden",
                'name': key,
                'value': value
            }).appendTo(`#${formTag}`);
        });
        
        $(`#${formTag}`).submit();
    };
    
    urlParameters = (language) => {
        let href = window.location.href;
        
        let pageStart = href.indexOf(`/${language}/`);
        let split = href.substring(pageStart, href.length).split("/");
        split.shift();
        
        return split;
    }
    
    urlParameterValue = (name) => {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        
        let regex = new RegExp(`[\\?&]${name}=([^&#]*)`);
        
        let parameters = regex.exec(window.location.search);
        
        return parameters === null ? "" : decodeURIComponent(parameters[1].replace(/\+/g, " "));
    }
    
    urlParameterRemove = (url, target) => {
        let result = url.split("?")[0];
        let parameter;
        let parameters = [];
        let query = (url.indexOf("?") !== -1) ? url.split("?")[1] : "";
        
        if (query !== "") {
            parameters = query.split("&");
            
            for (let a = parameters.length - 1; a >= 0; a -= 1) {
                parameter = parameters[a].split("=")[0];
                
                if (target === parameter)
                    parameters.splice(a, 1);
            }
            
            result += "?" + parameters.join("&");
        }
        
        return result;
    }
    
    removeElementAndResetIndex = (elements, index) => {
        elements.length = Object.keys(elements).length;
        elements.splice = [].splice;

        elements.splice(index, 1);

        delete elements.length;
        delete elements.splice;
        
        return elements;
    }
    
    objectToArray = (items) => {
        return $.map(items, (elements) => {
            return elements;
        });
    }
    
    isIntoView = (id) => {
        if ($(id).length === 0)
            return false;
	
	let viewport = {
            'top' : $(window).scrollTop(),
            'left' : $(window).scrollLeft()
	};
	viewport.right = viewport.left + $(window).width();
	viewport.bottom = viewport.top + $(window).height();
	
	let bounds = $(id).offset();
        bounds.right = bounds.left + $(id).outerWidth();
        bounds.bottom = bounds.top + $(id).outerHeight();

        return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
    }
    
    sortableElement = (tagParent, tagInput) => {
        this._populateSortableInput(tagParent, tagInput);
        
        if (this.checkWidthType() === "desktop") {
            $(".sort_result").find(".mdc-chip").removeClass("mdc-chip--selected");
            $(".sort_result").off("click");
            
            $(tagParent).find(".sort_list").sortable({
                'placeholder': "sortable_placeholder",
                'forcePlaceholderSize': true,
                'tolerance': "pointer",
                'handle': ".material-icons",
                'cancel': ".no_sortable",
                'start': (event, ui) => {
                    ui.placeholder.height(ui.item.height());
                },
                'stop': (event, ui) => {
                    ui.placeholder.height(0);
                    
                    this._populateSortableInput(tagParent, tagInput);
                }
            }).disableSelection();
        }
        else {
            if ($(tagParent).find(".sort_list").data("ui-sortable"))
                $(tagParent).find(".sort_list").sortable("destroy");

            $(".sort_result").off("click").on("click", ".mdc-chip", (event) => {
                let target = $(event.currentTarget).parent().hasClass("mdc-chip") === true ? $(event.currentTarget).parent() : $(event.currentTarget);

                if (target.hasClass("mdc-chip") === true) {
                    if (target.hasClass("mdc-chip--selected") === true) {
                        target.removeClass("mdc-chip--selected");

                        return;
                    }

                    $(".sort_result").find(".mdc-chip").removeClass("mdc-chip--selected");

                    target.hasClass("mdc-chip--selected") === true ? target.removeClass("mdc-chip--selected") : target.addClass("mdc-chip--selected");
                }
            });

            $(tagParent).find(".sort_control").find(".mdc-button").off("click").on("click", "", (event) => {
                let element = $(tagParent).find(".sort_list .mdc-chip--selected");

                if ($(event.target).find("i").hasClass("button_up") === true)
                    element.parent().insertBefore(element.parent().prev());
                else if ($(event.target).find("i").hasClass("button_down") === true)
                    element.parent().insertAfter(element.parent().next());

                this._populateSortableInput(tagParent, tagInput);
            });
        }
    }
    
    wordTag = (tagParent, tagInput) => {
        if ($(tagInput).val() !== undefined) {
            let inputValueSplit = $(tagInput).val().split(",");
            inputValueSplit.pop();
            
            let html = "";
            
            $.each(inputValueSplit, (key, value) => {
                let text = $(`${tagInput}_select`).find(`option[value='${value}']`).text();

                html += `<div class="mdc-chip">
                    <i class="material-icons mdc-chip__icon mdc-chip__icon--leading">delete</i>
                    <div class="mdc-chip__text wordTag_elemet_data" data-id="${value}">${text}</div>
                </div>`;
            });
            
            $(tagParent).find(".wordTag_result").html(html);
            
            $(`${tagInput}_select`).change((event) => {
                let targetValue = $(event.target).val();

                if ($.inArray(targetValue, inputValueSplit) === -1 && targetValue !== "") {
                    let text = $(event.target).find(`option[value='${targetValue}']`).text();

                    $(tagParent).find(".wordTag_result").append(
                        `<div class="mdc-chip">
                            <i class="material-icons mdc-chip__icon mdc-chip__icon--leading">delete</i>
                            <div class="mdc-chip__text wordTag_elemet_data" data-id="${targetValue}">${text}</div>
                        </div>`
                    );
                    
                    inputValueSplit.push(targetValue);
                    
                    $(tagInput).val(inputValueSplit.join(",") + ",");
                }
            });
            
            $(".wordTag_result").off("click").on("click", ".material-icons", (event) => {
                let removeItem = $(event.currentTarget).next().attr("data-id");

                inputValueSplit = $.grep(inputValueSplit, (value) => {
                    return value !== removeItem;
                });

                $(tagInput).val(inputValueSplit.join(",") + ",");

                $(event.currentTarget).parents(".mdc-chip").remove();
            });
        }
    }
    
    accordion = (type) => {
        let tag = "";
        
        if (type === "button")
            tag = ".button_accordion";
        else if (type === "icon")
            tag = ".icon_accordion";
        
        $(".accordion_container").find(tag).off("click").on("click", "", (event) => {
            let element = $(event.target);
            let accordion = $(event.target).next();
            
            $(".accordion_container").find(".accordion").not(accordion).prev().text(window.text.index_9);
            
            $(".accordion_container").find(".accordion").not(accordion).removeClass("accordion_active");
            
            if (type === "button") {
                if (accordion.hasClass("accordion_active") === false) {
                    element.text(window.text.index_10);

                    accordion.addClass("accordion_active");
                }
                else {
                    element.text(window.text.index_9);

                    accordion.removeClass("accordion_active");
                }
            }
            else if (type === "icon") {
                if (accordion.hasClass("accordion_active") === false) {
                    element.text("arrow_drop_up");

                    accordion.addClass("accordion_active");
                }
                else {
                    element.text("arrow_drop_down");

                    accordion.removeClass("accordion_active");
                }
            }
            
            materialDesign.refresh();
        });
    }
    
    selectOnlyOneElement = (tag) => {
        $(tag).on("click", "", (event) => {
            if ($(event.target).is("input") === true) {
                $.each($(tag).find("input"), (key, value) => {
                    $(value).not(event.target).prop("checked", false);
                });
            }
        });
    }
    
    fileNameFromSrc = (attribute, extension) => {
        let value = attribute.replace(/\\/g, "/");
        value = value.substring(value.lastIndexOf("/") + 1);
        
        return extension ? value.replace(/[?#].+$/, "") : value.split(".")[0];
    }
    
    imageError = (elements) => {
        elements.on("error", "", (event) => {
            $.each($(event.target), (key, value) => {
                $(value).prop("src", `${window.url.root}/images/templates/${window.setting.template}/error_404.png`);
            });
        });
    }
    
    imageRefresh = (tag, length) => {
        if (tag !== "") {
            let src = $(tag).prop("src");
            
            let srcSplit = src.split("?");

            if (srcSplit.length > length)
                src = `${srcSplit[0]}?${srcSplit[1]}`;
            
            $(tag).prop("src", `${src}?` + new Date().getTime());
        }
    }
    
    goToAnchor = (tag) => {
        $("html, body").animate({
            scrollTop: $(tag).offset().top
        }, 1000);
    }
    
    menuRoot = () => {
        $(".menu_root_container").find(".mdc-list-item").on("click", "", (event) => {
            if ($(event.target).hasClass("parent_icon") === true)
                event.preventDefault();
        });
        
        $(".menu_root_container").off("click").on("click", ".parent_icon", (event) => {
            if ($(event.currentTarget).parent().next().css("display") !== "block")
                $(event.currentTarget).parent().next().show();
            else
                $(event.currentTarget).parent().next().hide();
        });
        
        if (window.location.href.indexOf("control_panel") === -1) {
            let parameters = this.urlParameters(window.session.languageTextCode);
            
            $(".menu_root_container").find(".target").removeClass("current");
            
            $.each($(".menu_root_container").find(".target"), (key, value) => {
                if ($(value).prop("href").indexOf(parameters[1]) !== -1) {
                    $(value).addClass("current");

                    return false;
                }
                else if (parseInt(parameters[1]) === 2 && key === 0) {
                    $(value).addClass("current");

                    return false;
                }
            });
        }
    }
    
    bodyProgress = () => {
        let linearProgressMdc = new mdc.linearProgress.MDCLinearProgress.attachTo($("#body_progress").find(".mdc-linear-progress")[0]);
        
        let performanceTiming = window.performance.timeOrigin;
        let estimatedTime = performanceTiming.loadEventEnd - performanceTiming.navigationStart;
        let time = parseInt((estimatedTime / 1000) % 60) * 100;
        let stepTime = Math.abs(Math.floor(time / 100));
        let current = 0;
        
        let intervalEvent = setInterval(() => {
            current += 0.1;

            linearProgressMdc.progress = current;

            if (current >= 2) {
                $("#body_progress").fadeOut("slow");

                clearInterval(intervalEvent);
            }
        }, stepTime);
    }
    
    uploadFakeClick = () => {
        $(document).on("click", ".material_upload button", (event) => {
            let button = $(event.currentTarget);
            let input = button.parent().find("input");
            let name = "";
            
            input.click();
            
            input.on("change", "", (event) => {
                if (input[0].files[0] !== undefined)
                    name = input[0].files[0].name;
                
                button.parent().find(".material_upload_label").text(name);
            });
        });
    }
    
    serializeJson = (object) => {
        let elements = {};
        
        let serializeArray = object.serializeArray();
        
        let jsonString = JSON.stringify(serializeArray);
        let json = JSON.parse(jsonString);
        
        let name = "";
        
        $.each(json, (key, value) => {
            $.each(value, (keySub, valueSub) => {
                if (keySub === "name") {
                    let newName = valueSub.substring(valueSub.lastIndexOf("[") + 1, valueSub.lastIndexOf("]"));
                    
                    newName = newName.replace("_token", "token");
                    
                    name = newName;
                }
                else
                    elements[name] = valueSub;
            });
        });
        
        return elements;
    }
    
    unitFormat = (value) => {
        let result = "";
        
        if (value === 0)
            result = "0 Bytes";
        else {
            let reference = 1024;
            let sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

            let index = Math.floor(Math.log(value) / Math.log(reference));

            result = parseFloat((value / Math.pow(reference, index)).toFixed(2)) + ` ${sizes[index]}`;
        }
        
        return result;
    }
    
    padZero = (value) => {
        return (value < 10 ? "0" : "") + value;
    }
    
    replaceUrlParameter = (name, value) => {
        let ulr = window.location.search;
        let regex = new RegExp(`([?;&])${name}[^&;]*[;&]?`);
        let query = ulr.replace(regex, "$1").replace(/&$/, "");
        
        let result = (query.length > 2 ? query + "&" : "?") + (value ? `${name}=${value}` : "");
        
        window.history.replaceState("", "", window.location.pathname + result);
    }
    
    createLocalStorage = (name, value) => {
        localStorage.setItem(name, JSON.stringify(value));
    }

    readLocalStorage = (name) => {
        let elements = JSON.parse(localStorage.getItem(name));

        if (elements == null || Number.isNaN(elements) === true)
            elements = [];

        return elements;
    }

    removeLocalStorage = (name) => {
        localStorage.removeItem(name);
    }

    createSessionStorage = (name, value) => {
        sessionStorage.setItem(name, value);
    }

    readSessionStorage = (name) => {
        let elements = sessionStorage.getItem(name);

        if (elements == null)
            elements = [];

        return elements;
    }

    removeSessionStorage = (name) => {
        sessionStorage.removeItem(name);
    }

    createCookie = (name, value, expire, domain, secure) => {
        if (domain !== "")
            domain = `domain=${domain};`;

        let secureValue = secure === true ? "Secure;" : "";

        if (value === null)
            value = "";

        if (expire === 0)
            expire = new Date(Date.now() + (10000 * 365 * 24 * 60 * 60));
        else if (expire === -1)
            expire = new Date(0);

        document.cookie = `${name}=${JSON.stringify(value)};expires=${expire};${domain}path=/;${secureValue}`;
    }

    readCookie = (name) => {
        let result = document.cookie.match(`(^|;)?${name}=([^;]*)(;|$)`);

        return result != null ? result[2] : result;
    }

    removeCookie = (name) => {
        if (this.readCookie(name) !== null)
            this.createCookie(name, null, -1, "", true);
    }
    
    blockMultiTab = () => {
        if (window.setting.blockMultitab == true) {
            let tag = `${window.session.name}_blockMultiTab`;

            $(window).on("load", "", (event) => {
                let tabs = JSON.parse(localStorage.getItem(tag));

                if (tabs == null)
                    tabs = {'main': "", 'list': []};

                let tabId = sessionStorage.getItem(tag);

                if (tabId === null) {
                    tabId = Math.random().toString(36).substr(2, 9);

                    sessionStorage.setItem(tag, tabId.toString());
                }

                if (tabs.list.length === 0)
                    tabs.main = tabId;

                if ($.inArray(tabId, tabs.list) === -1)
                    tabs.list.push(tabId);

                if (tabs.list.length > 1 && tabs.main !== tabId) {
                    $("body").find(".column_left_container").remove();
                    $("body").find(".column_right_container").remove();
                    $("body").find(".column_center_container").attr("class", "mdc-layout-grid__cell mdc-layout-grid__cell--span-12 mdc-layout-grid__cell--span-12-tablet column_center_container");
                    $("body").find(".column_center_container .sortable_column").html(`<div class="error_page"><p class="mdc-typography--headline1">${window.text.index_11}</p></div>`);
                }

                localStorage.setItem(tag, JSON.stringify(tabs));
            });

            $(window).on("beforeunload", "", (event) => {
                let tabs = JSON.parse(localStorage.getItem(tag));

                let tabId = sessionStorage.getItem(tag);

                $.each(tabs.list, (key, value) => {
                    if (value === tabId)
                        tabs.list.splice(key, 1);
                });

                if (tabs.list.length === 0)
                    tabs.main = "";

                localStorage.setItem(tag, JSON.stringify(tabs));
            });
        }
    }

    // Functions private
    _populateSortableInput = (tagParent, tagInput) => {
        let idList = "";
        let elements = $(tagParent).find(".sort_elemet_data");

        $.each(elements, (key, value) => {
            idList += $(value).attr("data-id") + ",";
        });

        $(tagInput).val(idList);
    }
}