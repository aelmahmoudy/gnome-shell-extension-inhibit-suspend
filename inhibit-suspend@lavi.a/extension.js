/*
 *	Yet Another Inhibit Suspend Extension for GNOME shell
 *  Copyright (C) 2012 Lavi .A
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
const DBus = imports.dbus;
const Lang = imports.lang;
const St = imports.gi.St;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const GnomeSession = imports.misc.gnomeSession;
const UserMenu = imports.ui.userMenu;

const Gettext = imports.gettext.domain('gnome-shell-extension-inhibit-suspend');
const _ = Gettext.gettext;

const SessionIface = {
    name: "org.gnome.SessionManager",
    methods: [ 
    { name: "Inhibit", inSignature: "susu", outSignature: "u" },
    { name: "Uninhibit", inSignature: "u", outSignature: "" }
    ]
};

let SessionProxy = DBus.makeProxyClass(SessionIface);
let item, userMenu;

function init(extensionMeta) {
    imports.gettext.bindtextdomain("gnome-shell-extension-inhibit-suspend", extensionMeta.path + "/locale");
    userMenu = Main.panel._statusArea.userMenu;
}

function enable() {
    item = new PopupMenu.PopupSwitchMenuItem(_("Inhibit Suspend"), false);
    userMenu.menu.addMenuItem(item, 2);

    let inhibit = undefined;
    let sessionProxy = new SessionProxy(DBus.session, 'org.gnome.SessionManager', '/org/gnome/SessionManager');
    
    let onInhibit = function(cookie) {
        inhibit = cookie;
    };

    item.connect('toggled', Lang.bind(userMenu, function()
    {
        if(inhibit) {
            sessionProxy.UninhibitRemote(inhibit);
            inhibit = undefined;
        } else {
            try {
                sessionProxy.InhibitRemote("inhibitor", 0, "inhibit mode", 9, Lang.bind(this, onInhibit));
            } catch(e) {
                //
            }
        }
    }));
}

function disable() {
	if (item) {
        item.destroy();
    }
}