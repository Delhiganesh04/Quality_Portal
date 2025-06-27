sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter",
  "sap/m/MessageToast",
  "sap/m/Dialog",
  "sap/m/Label",
  "sap/m/Select",
  "sap/ui/core/Item",
  "sap/m/CheckBox",
  "sap/m/Button",
  "sap/ui/core/format/DateFormat",
  "sap/m/List",
  "sap/m/StandardListItem"
], function (
  Controller,
  Filter,
  FilterOperator,
  Sorter,
  MessageToast,
  Dialog,
  Label,
  Select,
  Item,
  CheckBox,
  Button,
  DateFormat,
  List,
  StandardListItem
) {
  "use strict";

  return Controller.extend("qualityportal.controller.UsageDecision", {
      formatter: {
          formatUsageDecision: function(sVauswahlmg) {
              switch(sVauswahlmg) {
                  case "02": return "Accepted";
                  case "03": return "Rejected";
                  default: return "Pending";
              }
          },
          
          usageDecisionState: function(sVauswahlmg) {
              switch(sVauswahlmg) {
                  case "02": return "Success";
                  case "03": return "Error";
                  default: return "Warning";
              }
          }
      },

      onInit: function () {
          this._aSorters = [];
          this._aGroupers = [];
          this._aFilters = [];
         
      },

      navBack: function () {
          history.go(-1);
      },

      onLogout: function () {
          var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
          loRouter.navTo("RouteLogin");
      },

      onItemPress: function (oEvent) {
          var oItem = oEvent.getSource();
          var oContext = oItem.getBindingContext();
          var oData = oContext.getObject();
          console.log(oData);
          var oDialog = this.byId("detailDialog3");

          this.byId("detailPrueflos3").setText(oData.prueflos || "N/A");
          this.byId("detailKzart").setText(oData.kzart || "N/A");
          this.byId("detailVwerks").setText(oData.vwerks || "N/A");
          this.byId("detailVcode3").setText(oData.vcode || "N/A");
          this.byId("detailVname").setText(oData.vname || "N/A");
          this.byId("detailVcodegrp").setText(oData.vcodegrp || "N/A");

          var oDate = this.byId("detailVdatum");
          if (oData.vdatum) {
              var oDateFormat = DateFormat.getDateInstance({style: "medium"});
              oDate.setText(oDateFormat.format(new Date(oData.vdatum)));
          } else {
              oDate.setText("N/A");
          }

          var oUsageDecision = this.byId("detailVauswahlmg");
          oUsageDecision.setText(this.formatter.formatUsageDecision(oData.vauswahlmg));
          oUsageDecision.setState(this.formatter.usageDecisionState(oData.vauswahlmg));

          oDialog.open();
      },

      onCloseDetailDialog: function () {
          this.byId("detailDialog3").close();
      },

      onSearch: function (oEvent) {
          var sQuery = oEvent.getSource().getValue();
          var oTable = this.byId("usageDecisionTable");

          if (!sQuery || sQuery.trim() === "") {
              oTable.getBinding("items").filter(this._aFilters);
              return;
          }

          var aFilters = [
              new Filter("prueflos", FilterOperator.Contains, sQuery),
              new Filter("vname", FilterOperator.Contains, sQuery),
              new Filter("vcode", FilterOperator.Contains, sQuery)
          ];

          if (this._aFilters.length > 0) {
              aFilters = this._aFilters.concat([
                  new Filter({ filters: aFilters, or: true })
              ]);
              oTable.getBinding("items").filter(new Filter({ filters: aFilters, and: true }));
          } else {
              oTable.getBinding("items").filter(new Filter({ filters: aFilters, or: true }));
          }
      },

      onFilterPress: function () {
          var that = this;

          if (!this._oFilterDialog) {
              this._oFilterDialog = new Dialog({
                  title: "Filter Usage Decisions",
                  content: [
                      new List({
                          items: [
                              new StandardListItem({
                                  title: "Accepted Decisions",
                                  type: "Active",
                                  press: function() {
                                      that._applyFilter("vcode", "A");
                                      that._oFilterDialog.close();
                                  }
                              }),
                              new StandardListItem({
                                  title: "Rejected Decisions",
                                  type: "Active",
                                  press: function() {
                                      that._applyFilter("vcode", "R");
                                      that._oFilterDialog.close();
                                  }
                              }),
                              new StandardListItem({
                                  title: "Clear All Filters",
                                  type: "Active",
                                  press: function() {
                                      that._clearAllFilters();
                                      that._oFilterDialog.close();
                                  }
                              })
                          ]
                      })
                  ],
                  endButton: new Button({
                      text: "Cancel",
                      press: function () {
                          that._oFilterDialog.close();
                      }
                  })
              });
              this.getView().addDependent(this._oFilterDialog);
          }

          this._oFilterDialog.open();
      },

      _applyFilter: function(sPath, sValue) {
          this._aFilters = [new Filter(sPath, FilterOperator.EQ, sValue)];
          this.byId("usageDecisionTable").getBinding("items").filter(this._aFilters);
          if(sValue === 'R'){
          MessageToast.show("Filtered by Rejected");
          }
          else{
            MessageToast.show("Filtered by Accepted" );
          }
      },

      _clearAllFilters: function() {
          this._aFilters = [];
          this.byId("usageDecisionTable").getBinding("items").filter([]);
          MessageToast.show("All filters cleared");
      },

      onSort: function () {
          var that = this;

          if (!this._oSortDialog) {
              this._oSortDialog = new Dialog({
                  title: "Sort Usage Decisions",
                  content: [
                      new List({
                          items: [
                              new StandardListItem({
                                  title: "By Inspection Lot (Ascending)",
                                  type: "Active",
                                  press: function() {
                                      that._applySorter("prueflos", false);
                                      that._oSortDialog.close();
                                  }
                              }),
                              new StandardListItem({
                                  title: "By Inspection Lot (Descending)",
                                  type: "Active",
                                  press: function() {
                                      that._applySorter("prueflos", true);
                                      that._oSortDialog.close();
                                  }
                              }),
                              new StandardListItem({
                                  title: "By Decision Date (Newest First)",
                                  type: "Active",
                                  press: function() {
                                      that._applySorter("vdatum", true);
                                      that._oSortDialog.close();
                                  }
                              }),
                              new StandardListItem({
                                  title: "By Decision Date (Oldest First)",
                                  type: "Active",
                                  press: function() {
                                      that._applySorter("vdatum", false);
                                      that._oSortDialog.close();
                                  }
                              }),
                              new StandardListItem({
                                  title: "Clear Sorting",
                                  type: "Active",
                                  press: function() {
                                      that._clearSorting();
                                      that._oSortDialog.close();
                                  }
                              })
                          ]
                      })
                  ],
                  endButton: new Button({
                      text: "Cancel",
                      press: function () {
                          that._oSortDialog.close();
                      }
                  })
              });
              this.getView().addDependent(this._oSortDialog);
          }

          this._oSortDialog.open();
      },

      _applySorter: function(sPath, bDescending) {
          this._aSorters = [new Sorter(sPath, bDescending)];
          this.byId("usageDecisionTable").getBinding("items").sort(this._aSorters);
          MessageToast.show("Sorted by " + sPath + (bDescending ? " (Descending)" : " (Ascending)"));
      },

      _clearSorting: function() {
          this._aSorters = [];
          this.byId("usageDecisionTable").getBinding("items").sort([]);
          MessageToast.show("Sorting cleared");
      },

      onGroup: function () {
          var that = this;

          if (!this._oGroupDialog) {
              this._oGroupDialog = new Dialog({
                  title: "Group Usage Decisions",
                  content: [
                      new List({
                          items: [
                              new StandardListItem({
                                  title: "By Usage Decision",
                                  type: "Active",
                                  press: function() {
                                      that._applyGrouper("vauswahlmg");
                                      that._oGroupDialog.close();
                                  }
                              }),
                              new StandardListItem({
                                  title: "By Decision Code",
                                  type: "Active",
                                  press: function() {
                                      that._applyGrouper("vcode");
                                      that._oGroupDialog.close();
                                  }
                              }),
                              new StandardListItem({
                                  title: "By Plant",
                                  type: "Active",
                                  press: function() {
                                      that._applyGrouper("vwerks");
                                      that._oGroupDialog.close();
                                  }
                              }),
                              new StandardListItem({
                                  title: "Clear Grouping",
                                  type: "Active",
                                  press: function() {
                                      that._clearGrouping();
                                      that._oGroupDialog.close();
                                  }
                              })
                          ]
                      })
                  ],
                  endButton: new Button({
                      text: "Cancel",
                      press: function () {
                          that._oGroupDialog.close();
                      }
                  })
              });
              this.getView().addDependent(this._oGroupDialog);
          }

          this._oGroupDialog.open();
      },

      _applyGrouper: function(sPath) {
          this._aGroupers = [new Sorter(sPath, false, true)];
          this.byId("usageDecisionTable").getBinding("items").sort(this._aGroupers);
          MessageToast.show("Grouped by " + sPath);
      },

      _clearGrouping: function() {
          this._aGroupers = [];
          this.byId("usageDecisionTable").getBinding("items").sort([]);
          MessageToast.show("Grouping cleared");
      },

      onUpdateFinished: function (oEvent) {
          var iTotalItems = oEvent.getParameter("total");
          this.byId("tableHeader").setText("Usage Decisions (" + iTotalItems + ")");
      }
  });
});