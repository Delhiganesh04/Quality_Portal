sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageStrip"
], (Controller,MessageToast) => {
    "use strict";

    return Controller.extend("qualityportal.controller.Login", {
        onInit() {
        },


        onLogin: async function () {
            const oView = this.getView();
            const sUsername = oView.byId("username").getValue().trim();
            let sPassword = oView.byId("password").getValue().trim();


            sPassword = sPassword.trim();

            try {
                const hashedPassword = await this.hashPasswordSHA256(sPassword);

                
                console.log("Username:", sUsername);
                console.log("SHA-256 Password:", (hashedPassword));
                var oModel = this.getOwnerComponent().getModel();
            var some = this;
            oModel.read(`/Login(p_username='${sUsername}')/Set`, {
                success: function(oData) {
                    var oJsonModel = new sap.ui.model.json.JSONModel(oData);
                  
                    const username = oJsonModel.oData.results[0].p_username.trim()
                    const password = oJsonModel.oData.results[0].hashedpw.trim()
                    console.log(username)
                    console.log((password))
                    if(sUsername === username && hashedPassword === password){
                        // MessageToast.show("Login Success");
                        var loRouter = sap.ui.core.UIComponent.getRouterFor(some);
                        var ms = some.byId("_IDGenMessageStrip");
                        ms.setVisible(true);
                        setTimeout(() => loRouter.navTo("RouteDashboard"), 2000);
                        // ms.setVisible(false)
                        console.log("Success")
                    }
                    else{
                        // MessageToast.show("Invalid Credentials");
                        var ms = some.byId("_IDGenMessageStrip1");
                        ms.setVisible(true);
                        console.log("Invalid Credentials")
                    }
                },
                error: function(oError) {
                    console.error("Login error:", oError);
                    MessageToast.show("Login failed. Please try again.");
                }
            });

               

            } catch (err) {
                console.error("Hashing failed", err);
            }
        },

        hashPasswordSHA256: async function (password) {
            const encoder = new TextEncoder();
            const data = encoder.encode(password);
            const hashBuffer = await crypto.subtle.digest("SHA-256", data);
            const base64Hash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
            return base64Hash;
        }
        
    });
});