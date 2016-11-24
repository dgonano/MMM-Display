// main javascript file for the remote control page

var Remote = {
    loadButtons: function(buttons) {
        for (var key in buttons) {
            if (buttons.hasOwnProperty(key)) {
                var element = document.getElementById(key);

                element.addEventListener("click", buttons[key], false);
            }
        }
    },

    hasClass: function(element, name) {
        return (' ' + element.className + ' ').indexOf(' ' + name + ' ') > -1;
    },


    showMenu: function(newMenu) {
        var allMenus = document.getElementsByClassName("menu-element");

        for (var i = 0; i < allMenus.length; i++) {
            var button = allMenus[i];

            button.style.display = 'none';
        }

        var currentMenu = document.getElementsByClassName(newMenu);

        for (var i = 0; i < currentMenu.length; i++) {
            var button = currentMenu[i];

            button.style.display = 'block';
        }

        this.setStatus('none');
    },

    setStatus: function(status) {
        var allMenus = document.getElementsByClassName("status-indicator");

        for (var i = 0; i < allMenus.length; i++) {
            var button = allMenus[i];

            button.style.display = 'none';
        }

        var currentInfo = document.getElementById(status);

        if (currentInfo)
        {
            currentInfo.style.display = 'block';
        }
    },

    getWithStatus: function(params, callback) {
        var self = this;

        self.setStatus('loading');
        self.get(params, function (response) {
            if (callback) {
                callback(response);
            } else {
                var result = JSON.parse(response);
                if (result.status === "success") {
                    self.setStatus('success');
                } else {
                    self.setStatus('error');
                }
            }
        });
    },

    get: function(params, callback) {
        var http = new XMLHttpRequest();
        var url = "display?" + params;
        http.open("GET", url, true);

        //Send the proper header information along with the request
        http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        http.onreadystatechange = function() {
            if(http.readyState == 4 && http.status == 200) {
                if (callback)
                {
                    callback(http.responseText);
                }
            }
        }
        http.send(null);
    }
};

var buttons = {
    // navigation buttons
    'back-button': function () {
        window.location.hash = 'main-menu';
    },
    'message-button': function () {
        Remote.getWithStatus("action=MESSAGE&value=" + document.getElementById("message-input").value);
    }
}

Remote.loadButtons(buttons);

Remote.setStatus('none');

if (window.location.hash) {
    Remote.showMenu(window.location.hash.substring(1));
} else {
    Remote.showMenu('main-menu');
}

window.onhashchange = function() {
    if (window.location.hash) {
        Remote.showMenu(window.location.hash.substring(1));
    } else {
        Remote.showMenu('main-menu');
    }
}
