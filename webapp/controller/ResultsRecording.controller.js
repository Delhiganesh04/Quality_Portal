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

  return Controller.extend("qualityportal.controller.ResultsRecording", {
      formatter: {
          formatStockCategory: function(sStat35) {
              switch(sStat35) {
                  case "X": return "Unrestricted (Good)";
                  case "Y": return "Block (Defective)";
                  case "Z": return "Production (Rework)";
                  default: return "Not Categorized";
              }
          },
          
          stockCategoryState: function(sStat35) {
              switch(sStat35) {
                  case "X": return "Success";
                  case "Y": return "Error";
                  case "Z": return "Warning";
                  default: return "None";
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
          var oDialog = this.byId("detailDialog");

          this.byId("detailPrueflos").setText(oData.prueflos || "N/A");
          this.byId("detailVorglfnr").setText(oData.vorglfnr || "N/A");
          this.byId("detailMerknr").setText(oData.merknr || "N/A");
          this.byId("detailWerk").setText(oData.werk || "N/A");
          this.byId("detailArt").setText(oData.art || "N/A");
          this.byId("detailSelmatnr").setText(oData.selmatnr || "N/A");
          this.byId("detailObjnr").setText(oData.objnr || "N/A");

          var oValuation = this.byId("detailMbewertg");
          oValuation.setText(oData.mbewertg || "N/A");
          oValuation.setState(oData.mbewertg === 'A' ? 'Success' : 'Error');

          var oStockCat = this.byId("detailStat35");
          oStockCat.setText(this.formatter.formatStockCategory(oData.stat35));
          oStockCat.setState(this.formatter.stockCategoryState(oData.stat35));

          oDialog.open();
      },

      onCloseDetailDialog: function () {
          this.byId("detailDialog").close();
      },

      onSearch: function (oEvent) {
          var sQuery = oEvent.getSource().getValue();
          var oTable = this.byId("resultsTable");
          

          if (!sQuery || sQuery.trim() === "") {
              oTable.getBinding("items").filter(this._aFilters);
              return;
          }

          var aFilters = [
              new Filter("prueflos", FilterOperator.Contains, sQuery)
            //   new Filter("vorglfnr", FilterOperator.Contains, sQuery),
            //   new Filter("merknr", FilterOperator.Contains, sQuery)
          ];
          console.log(aFilters);

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
                  title: "Filter Results",
                  content: [
                      new List({
                          items: [
                              new StandardListItem({
                                  title: "Unrestricted Stock (Good)",
                                  type: "Active",
                                  press: function() {
                                      that._applyFilter("stat35", "X");
                                      that._oFilterDialog.close();
                                  }
                              }),
                              new StandardListItem({
                                  title: "Block Stock (Defective)",
                                  type: "Active",
                                  press: function() {
                                      that._applyFilter("stat35", "Y");
                                      that._oFilterDialog.close();
                                  }
                              }),
                              new StandardListItem({
                                  title: "Production Stock (Rework)",
                                  type: "Active",
                                  press: function() {
                                      that._applyFilter("stat35", "Z");
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
          this.byId("resultsTable").getBinding("items").filter(this._aFilters);
          MessageToast.show("Filtered by " + this.formatter.formatStockCategory(sValue));
      },

      _clearAllFilters: function() {
          this._aFilters = [];
          this.byId("resultsTable").getBinding("items").filter([]);
          MessageToast.show("All filters cleared");
      },

      onSort: function () {
          var oTable = this.byId("resultsTable");
          var that = this;

          if (!this._oSortDialog) {
              this._oSortDialog = new Dialog({
                  title: "Sort Results",
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
                                  title: "By Operation (Ascending)",
                                  type: "Active",
                                  press: function() {
                                      that._applySorter("vorglfnr", false);
                                      that._oSortDialog.close();
                                  }
                              }),
                              new StandardListItem({
                                  title: "By Operation (Descending)",
                                  type: "Active",
                                  press: function() {
                                      that._applySorter("vorglfnr", true);
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
          this.byId("resultsTable").getBinding("items").sort(this._aSorters);
          MessageToast.show("Sorted by " + sPath + (bDescending ? " (Descending)" : " (Ascending)"));
      },

      _clearSorting: function() {
          this._aSorters = [];
          this.byId("resultsTable").getBinding("items").sort([]);
          MessageToast.show("Sorting cleared");
      },

      onGroup: function () {
          var oTable = this.byId("resultsTable");
          var that = this;

          if (!this._oGroupDialog) {
              this._oGroupDialog = new Dialog({
                  title: "Group Results",
                  content: [
                      new List({
                          items: [
                              new StandardListItem({
                                  title: "By Stock Category",
                                  type: "Active",
                                  press: function() {
                                      that._applyGrouper("stat35");
                                      that._oGroupDialog.close();
                                  }
                              }),
                              new StandardListItem({
                                  title: "By Valuation",
                                  type: "Active",
                                  press: function() {
                                      that._applyGrouper("mbewertg");
                                      that._oGroupDialog.close();
                                  }
                              }),
                              new StandardListItem({
                                  title: "By Plant",
                                  type: "Active",
                                  press: function() {
                                      that._applyGrouper("werk");
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
          this.byId("resultsTable").getBinding("items").sort(this._aGroupers);
          MessageToast.show("Grouped by " + sPath);
      },

      _clearGrouping: function() {
          this._aGroupers = [];
          this.byId("resultsTable").getBinding("items").sort([]);
          MessageToast.show("Grouping cleared");
      },

      onUpdateFinished: function (oEvent) {
          var iTotalItems = oEvent.getParameter("total");
          this.byId("tableHeader").setText("Result Records (" + iTotalItems + ")");
      }
  });
});