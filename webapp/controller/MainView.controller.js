sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
  function(Controller, JSONModel) {
    "use strict";

    return Controller.extend("com.audit.ictas.auditsayim.controller.MainView", {
      onInit: function() {
        this.oDataModel = this.getOwnerComponent().getModel();
        this.oMainModel = this.getOwnerComponent().getModel("mainModel");
        this.getView().setModel(this.oMainModel, "mainModel");
      },

      handleTBvalueHelp: function(oEvent) {
        var that = this;
        this.onTeknikBirim();

        if (!this._oTBDialog) {
          this._oTBDialog = sap.ui.xmlfragment(
            "dialogTBValueH",
            "com.audit.ictas.auditsayim.view.dialog.TeknikBirimAra",
            this
          );
          this.getView().addDependent(this._oTBDialog);
        }
        jQuery.sap.delayedCall(
          0,
          this,
          function() {
            that._oTBDialog.open();
            that._oTBDialog.setBusy(true);
            setTimeout(function() {
              that._oTBDialog.setBusy(false);
            }, 1000);
          }.bind(this)
        );
      },
      onTeknikBirim: function() {
        var that = this;
        this.oDataModel.read("/GetEkipmanInitialSet", {
          filters: [
            new sap.ui.model.Filter("IArbpl", sap.ui.model.FilterOperator.EQ, "value"),
            new sap.ui.model.Filter("EtEkipman", sap.ui.model.FilterOperator.EQ, "X"),
            new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, "X")
          ],
          urlParameters: {
            $expand: "TeknikBirimSet"
          },
          success(oData, oResponse) {
            var data = oData.results[0].TeknikBirimSet.results;
            that.transformToTree(data);
          },
          error(oError) {
            debugger;
          }
        });
      },

      transformToTree: function(list) {
        var map = {},
          node,
          roots = [],
          i;

        for (i = 0; i < list.length; i += 1) {
          map[list[i].Tplnr] = i; // initialize the map
          list[i].subList = []; // initialize the children
        }

        for (i = 0; i < list.length; i += 1) {
          node = list[i];
          if (node.Tplma !== "") {
            // if you have dangling branches check that map[node.parentId] exists
            list[map[node.Tplma]].subList.push(node);
          } else {
            roots.push(node);
          }
        }

        var jsonModel = new JSONModel({
          TeknikBirimTree: roots,
          TeknikBirimList: list
        });
        this.getView().setModel(jsonModel, "tb");
        this.getView().getModel("tb").refresh();
        return roots;
      },

      onGetEkipmanTipi: function(oEvent) {
        var that = this;
        this.oDataModel.read("/GetEkipmanInitialSet", {
          filters: [
            new sap.ui.model.Filter("IArbpl", sap.ui.model.FilterOperator.EQ, ""),
            new sap.ui.model.Filter("EtEkipmanTipi", sap.ui.model.FilterOperator.EQ, "X"),
            new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, "X")
          ],
          urlParameters: {
            $expand: "EkipmanTipiSet"
          },
          success(oData, oResponse) {
            var data = oData.results[0].EkipmanTipiSet.results;
            if (data.length > 0) {
              that.oMainModel.setProperty("/EquipmentTypeList", data);
            } else {
              that.oMainModel.setProperty("/EquipmentTypeList", []);
            }
          },
          error(oError) {
            try {
              var errMessage = JSON.parse(oError.responseText);
              errMessage = errMessage.error.message.value;
            } catch (e) {
              errMessage = oError.message;
            }
            sap.m.MessageBox.alert(errMessage, {
              icon: sap.m.MessageBox.Icon.ERROR,
              title: "Hata Oluştu!"
            });
          }
        });
      },

      onNesneTuru: function(oEvent) {
        var that = this;
        this.oDataModel.read("/GetEkipmanInitialSet", {
          filters: [
            new sap.ui.model.Filter("EtTechnicalobjecttype", sap.ui.model.FilterOperator.EQ, "X"),
            new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, "X")
          ],
          urlParameters: {
            $expand: "TechnicalObjectTypeSet"
          },
          success(oData, oResponse) {
            var data = oData.results[0].TechnicalObjectTypeSet.results;
            if (data.length > 0) {
              that.oMainModel.setProperty("/TechnicalObjectTypeList", data);
            } else {
              that.oMainModel.setProperty("/TechnicalObjectTypeList", []);
            }
          },
          error(oError) {
            try {
              var errMessage = JSON.parse(oError.responseText);
              errMessage = errMessage.error.message.value;
            } catch (e) {
              errMessage = oError.message;
            }
            sap.m.MessageBox.alert(errMessage, {
              icon: sap.m.MessageBox.Icon.ERROR,
              title: "Hata Oluştu!"
            });
          }
        });
      }
    });
  }
);
