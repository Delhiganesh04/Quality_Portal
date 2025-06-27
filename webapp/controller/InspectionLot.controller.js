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
  "sap/m/RadioButton",
  "sap/m/RadioButtonGroup",
  "sap/m/DatePicker",
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
  RadioButton,
  RadioButtonGroup,
  DatePicker,
  DateFormat,
  List,
  StandardListItem
) {
  "use strict";

  return Controller.extend("qualityportal.controller.InspectionLot", {
      formatter: {
          quantityState: function (fValue) {
              try {
                  fValue = parseFloat(fValue);
                  if (fValue <= 0) {
                      return "Error";
                  } else if (fValue < 10) {
                      return "Warning";
                  } else {
                      return "Success";
                  }
              } catch (err) {
                  return "None";
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

      onlogout: function () {
          var loRouter = sap.ui.core.UIComponent.getRouterFor(this);
          loRouter.navTo("RouteLogin");
      },

      onItemPress: function (oEvent) {
          var oItem = oEvent.getSource();
          var oContext = oItem.getBindingContext();
          var oData = oContext.getObject();
          var oDialog = this.byId("lotDetailDialog");

          var oDateFormat = DateFormat.getDateInstance({ pattern: "MMM d, yyyy" });

          var oCreationDate = oData.enstehdat ? new Date(oData.enstehdat) : null;
          var oStartDate = oData.pastrterm ? new Date(oData.pastrterm) : null;
          var oEndDate = oData.paendterm ? new Date(oData.paendterm) : null;

          this.byId("detailPrueflos1").setText(oData.prueflos || "N/A");
          this.byId("detailSelmatnr1").setText(oData.selmatnr || "N/A");
          this.byId("detailKtextmat").setText(oData.ktextmat || "N/A");
          this.byId("detailWerk1").setText(oData.werk || "N/A");
          this.byId("detailArt1").setText(oData.art || "N/A");
          this.byId("detailEnstehdat").setText(oCreationDate ? oDateFormat.format(oCreationDate) : "N/A");
          this.byId("detailPastrterm").setText(oStartDate ? oDateFormat.format(oStartDate) : "N/A");
          this.byId("detailPaendterm").setText(oEndDate ? oDateFormat.format(oEndDate) : "N/A");

          var oNumber = this.byId("detailLosmenge");
          oNumber.setNumber(oData.losmenge || 0);
          oNumber.setUnit(oData.mengeneinh || "");
          oNumber.setState(this.formatter.quantityState(oData.losmenge));

          var oStatus = this.byId("detailVcode");
          oStatus.setText(oData.vcode || "N/A");
          oStatus.setState(oData.vcode === 'A' ? 'Success' : oData.vcode === 'B' ? 'Warning' : 'Error');

          oDialog.open();
      },

      onCloseDetailDialog: function () {
          this.byId("lotDetailDialog").close();
      },

      onSearch: function (oEvent) {
          var sQuery = oEvent.getSource().getValue();
          var oTable = this.byId("lotsTable");

          if (!sQuery || sQuery.trim() === "") {
              oTable.getBinding("items").filter(this._aFilters);
              return;
          }

          var aFilters = [
              new Filter("prueflos", FilterOperator.Contains, sQuery),
              new Filter("selmatnr", FilterOperator.Contains, sQuery),
              new Filter("ktextmat", FilterOperator.Contains, sQuery),
              new Filter("werk", FilterOperator.Contains, sQuery)
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

          if (!this._oDateFilterDialog) {
              this._oDateFilterDialog = new Dialog({
                  title: "Filter by Date Range",
                  content: [
                      new Label({ text: "Start Date:" }),
                      new DatePicker("startDatePicker", {
                          placeholder: "Select Start Date"
                      }),
                      new Label({ text: "End Date:" }),
                      new DatePicker("endDatePicker", {
                          placeholder: "Select End Date"
                      })
                  ],
                  beginButton: new Button({
                      text: "Apply",
                      press: function () {
                          var oStartDate = sap.ui.getCore().byId("startDatePicker").getDateValue();
                          var oEndDate = sap.ui.getCore().byId("endDatePicker").getDateValue();

                          if (!oStartDate || !oEndDate) {
                              MessageToast.show("Please select both start and end dates.");
                              return;
                          }

                          that._aFilters = that._aFilters.filter(f => f.sPath !== "enstehdat");

                          that._aFilters.push(new Filter({
                              path: "enstehdat",
                              operator: FilterOperator.BT,
                              value1: oStartDate,
                              value2: oEndDate
                          }));

                          var oTable = that.byId("lotsTable");
                          oTable.getBinding("items").filter(that._aFilters);

                          var oDateFormat = DateFormat.getDateInstance({ pattern: "MMM d, yyyy" });
                          MessageToast.show("Filtered from " + oDateFormat.format(oStartDate) + " to " + oDateFormat.format(oEndDate));

                          that._oDateFilterDialog.close();
                      }
                  }),
                  endButton: new Button({
                      text: "Cancel",
                      press: function () {
                        that._aFilters = that._aFilters.filter(f => f.sPath !== "enstehdat");
                    that.byId("lotsTable").getBinding("items").filter(that._aFilters);
                          that._oDateFilterDialog.close();
                      }
                  })
              });

              this.getView().addDependent(this._oDateFilterDialog);
          }

          sap.ui.getCore().byId("startDatePicker").setValue(null);
          sap.ui.getCore().byId("endDatePicker").setValue(null);

          this._oDateFilterDialog.open();
      },

      onClearFilter: function () {
          var oTable = this.byId("lotsTable");
          var oBinding = oTable.getBinding("items");

          this._aFilters = [];
          oBinding.filter([]);

          MessageToast.show("All filters cleared");
      },

      onSort: function () {
          var oTable = this.byId("lotsTable");

          if (!this._oSortDialog) {
              this._oSortDialog = new Dialog({
                  title: "Sort Inspection Lots",
                  content: [
                      new Label({ text: "Sort by", labelFor: "sortSelect" }),
                      new Select({
                          items: [
                              new Item({ key: "prueflos", text: "Inspection Lot" }),
                              new Item({ key: "selmatnr", text: "Material" }),
                              new Item({ key: "enstehdat", text: "Creation Date" }),
                              new Item({ key: "losmenge", text: "Quantity" })
                          ]
                      }),
                      new CheckBox({
                          text: "Descending Order",
                          selected: false
                      })
                  ],
                  beginButton: new Button({
                      text: "Apply",
                      press: function () {
                          var oSortSelect = this._oSortDialog.getContent()[1];
                          var oDescendingCheck = this._oSortDialog.getContent()[2];

                          var sSortBy = oSortSelect.getSelectedKey();
                          var bDescending = oDescendingCheck.getSelected();

                          this._aSorters = [new Sorter(sSortBy, bDescending)];
                          oTable.getBinding("items").sort(this._aSorters);

                          this._oSortDialog.close();
                      }.bind(this)
                  }),
                  endButton: new Button({
                      text: "Cancel",
                      press: function () {
                        this._aSorters = [];
                    oTable.getBinding("items").sort([]);
                          this._oSortDialog.close();
                      }.bind(this)
                  })
              });
              this.getView().addDependent(this._oSortDialog);
          }

          this._oSortDialog.open();
      },

      onGroup: function () {
          var oTable = this.byId("lotsTable");

          if (!this._oGroupDialog) {
              this._oGroupDialog = new Dialog({
                  title: "Group Inspection Lots",
                  content: [
                      new Label({ text: "Group by", labelFor: "groupSelect" }),
                      new Select({
                          items: [
                              new Item({ key: "werk", text: "Plant" }),
                              new Item({ key: "art", text: "Inspection Type" }),
                              new Item({ key: "ktextmat", text: "Material Description" }),
                              new Item({ key: "vcode", text: "Status" })
                          ]
                      })
                  ],
                  beginButton: new Button({
                      text: "Apply",
                      press: function () {
                          var oGroupSelect = this._oGroupDialog.getContent()[1];
                          var sGroupBy = oGroupSelect.getSelectedKey();

                          this._aGroupers = [new Sorter(sGroupBy, false, true)];
                          oTable.getBinding("items").sort(this._aGroupers);

                          this._oGroupDialog.close();
                      }.bind(this)
                  }),
                  endButton: new Button({
                      text: "Cancel",
                      press: function () {
                        this._aGroupers = [];
                        oTable.getBinding("items").sort([]);
                          this._oGroupDialog.close();
                      }.bind(this)
                  })
              });
              this.getView().addDependent(this._oGroupDialog);
          }

          this._oGroupDialog.open();
      },



      onUpdateFinished: function (oEvent) {
          var iTotalItems = oEvent.getParameter("total");
          this.byId("tableHeader").setText("Inspection Lots (" + iTotalItems + ")");
      }
  });
});