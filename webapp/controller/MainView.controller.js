sap.ui.define(
  ["sap/ui/core/mvc/Controller"],
  /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
  function(Controller) {
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
      },
      onTeknikBirim: function() {
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
          },
          error(oError) {
            debugger;
          }
        });
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
