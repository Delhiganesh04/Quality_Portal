sap.ui.define([
    "sap/ui/core/mvc/Controller"
  ], function (Controller) {
    "use strict";
    return Controller.extend("qualityportal.controller.Dashboard", {
      onInit: function () {
        
        
      },
      

      navBack: function(){
        history.go(-1)
      },
      onlogout: function(){
        var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
                        loRouter.navTo("RouteLogin");
      },
      onInspectionLotPress: function(){
        var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
        loRouter.navTo("RouteInspLot");
      },
      onResultsRecordingPress:function(){
        var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
        loRouter.navTo("RouteResRecord");
      },
      onUsageDecisionPress:function(){
        var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
        loRouter.navTo("RouteUD");
      }
    });
  });
  