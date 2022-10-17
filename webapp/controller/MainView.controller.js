sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel", "sap/m/MessageToast"],
  /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
  function(Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("com.audit.ictas.auditsayim.controller.MainView", {
      onInit: function() {
        this.oDataModel = this.getOwnerComponent().getModel();
        this.oDataModel.setUseBatch(false);
        this.oMainModel = this.getOwnerComponent().getModel("mainModel");
        this.getView().setModel(this.oMainModel, "mainModel");

        var formData = {
          IEqart: "",
          IEqtyp: "",
          teknikBirimInput: ""
        };
        this.getView().getModel("mainModel").setProperty("/form", formData);
        var jsonModel = new JSONModel({
          TeknikBirimTree: [],
          TeknikBirimList: []
        });
        this.getView().setModel(jsonModel, "tb");

        var that = this;
        if (sap.ui.Device.system.desktop === true) {
          that.getView().byId("idForm").setWidth("50%");
        } else if (sap.ui.Device.system.phone === true) {
          that.getView().byId("idForm").setWidth("100%");
        }
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
            that.transformToTree(data).then(function() {
              that.getView().getModel("tb").setProperty("/TeknikBirimList", data);
            });
          },
          error(oError) {
            debugger;
          }
        });
      },

      transformToTree: function(list) {
        return new Promise(
          function(resolve, reject) {
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

            // var jsonModel = new JSONModel({
            //   TeknikBirimTree: roots
            //   //  TeknikBirimList: list
            // });
            // this.getView().setModel(jsonModel, "tb");
            this.getView().getModel("tb").setProperty("/TeknikBirimTree", roots);
            resolve(roots);
          }.bind(this)
        );
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
      },
      tbSecClick: function() {
        var table = sap.ui.core.Fragment.byId("dialogTBValueH", "TreeTableBasic");
        var selectedIndex = table.getSelectedIndex();
        var data = table.getContextByIndex(selectedIndex).getObject();
        this.getView().getModel("mainModel").setProperty("/form/teknikBirimInput", data.Tplnr);
        this.tbDialogClose();
      },
      tbDialogClose: function() {
        this._oTBDialog.close();
      },

      onSearchTb: function(e) {
        var tbInput = sap.ui.core.Fragment.byId("dialogTBValueH", "idTbInput").getValue() || "";

        var data = this.getView().getModel("tb").getData();

        var match = [];
        var matchTop = [];

        match = _.filter(data.TeknikBirimList, function(item) {
          return item.Pltxt.match(new RegExp(tbInput, "i")) !== null;
        });

        _.forEach(match, function(o) {
          if (o.Tplma.indexOf("-") > -1) {
            var splitList = o.Tplnr.split("-");
            var temp = splitList[0];
            for (var i = 1; i < splitList.length; i++) {
              matchTop = _.uniqBy(
                _.concat(
                  matchTop,
                  _.filter(data.TeknikBirimList, {
                    Tplnr: temp
                  })
                ),
                "Tplnr"
              );
              temp = temp + "-" + splitList[i];
            }
          } else {
            matchTop = _.filter(data.TeknikBirimList, {
              Tplnr: o.Tplma
            });
          }
        });

        var list = _.uniqBy(_.concat(matchTop, match), "Tplnr");

        this.transformToTree(list).then(response => {
          var teknikBirimTree = response;
          data.TeknikBirimTree = teknikBirimTree;
        });

        this.getView().getModel().refresh();

        //var oTreeTable = this.byId("TreeTableBasic");
        var oTreeTable = sap.ui.core.Fragment.byId("dialogTBValueH", "TreeTableBasic");
        oTreeTable.expandToLevel(1);
      },
      searchClick: function(oEvent) {
        var that = this;

        var filterData = this.getView().getModel("mainModel").getData().form;

        sap.ui.core.BusyIndicator.show(0);

        this.oDataModel.read("/GetZimmetListSet", {
          filters: [
            new sap.ui.model.Filter(
              "ITplnr",
              sap.ui.model.FilterOperator.EQ,
              filterData.teknikBirimInput
            ), //teknik birim
            new sap.ui.model.Filter("IEqtyp", sap.ui.model.FilterOperator.EQ, filterData.IEqtyp), //ekipman tipi
            new sap.ui.model.Filter("IEqart", sap.ui.model.FilterOperator.EQ, filterData.IEqart)
          ],
          success(oData, oResponse) {
            sap.ui.core.BusyIndicator.hide(0);

            var data = oData.results;
            if (data.length > 0) {
              that.oMainModel.setProperty("/ZimmetList", data);
              that.oMainModel.setProperty("/form/searchListCount", data.length);
            } else {
              that.oMainModel.setProperty("/ZimmetList", []);
            }
          },
          error(oError) {
            sap.ui.core.BusyIndicator.hide(0);
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

      zimmetKaydetClick: function(oEvent) {
        this.onSorIsYeri();

        if (!this._popUpDialog) {
          this._popUpDialog = sap.ui.xmlfragment(
            "popUpDialog",
            "com.audit.ictas.auditsayim.view.dialog.PopupDialog",
            this
          );
          this.getView().addDependent(this._popUpDialog);
        }
        jQuery.sap.delayedCall(
          0,
          this,
          function() {
            this._popUpDialog.open();
          }.bind(this)
        );
      },

      onSorIsYeri: function() {
        var that = this;
        this.oDataModel.read("/GetEkipmanInitialSet", {
          filters: [
            new sap.ui.model.Filter("EtWorkcenterAll", sap.ui.model.FilterOperator.EQ, "X"),
            new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, "X")
          ],
          urlParameters: {
            $expand: "WorkCenterAllSet"
          },
          success: function(oData, oResponse) {
            var x = 2;
            that.oMainModel.setProperty(
              "/WorkCenterAllList",
              oData.results[0].WorkCenterAllSet.results
            );
            that.oMainModel.setProperty(
              "/WorkCenterAllListSelected",
              oData.results[0].WorkCenterAllSet.results
            );
          },
          error: function(oError) {}
        });
      },
      dialogClose: function() {
        this._popUpDialog.close();
      },

      dialogSave: function(oEvent) {
        var that = this;
        var selectedRowContextPaths = this.byId("productsTable").getSelectedContextPaths();
        var model = this.getView().getModel("mainModel");

        var items = {};
        var saveAudit = [];
        for (var i in selectedRowContextPaths) {
          var data = model.getProperty(selectedRowContextPaths[i]);
          items.IArbpl = this.oMainModel.getData().Objid;
          items.IEqunr;
          items.IAudit = "X";
          items.ILongtext = this.oMainModel.getData().IlongText;
          items.ITplnr = data.Tplnr;
          let Equnr = { IEqunr: data.Equnr };
          saveAudit.push(Equnr);
        }
        items.saveAudit = saveAudit;
        sap.ui.core.BusyIndicator.show(0);
        this.oDataModel.create("/SaveAuditSet", items, {
          async: true,
          success: function(oData, oResponse) {
            sap.ui.core.BusyIndicator.hide(0);
            var hdrMessage = oResponse.headers["sap-message"];
            var hdrMessageObject = JSON.parse(hdrMessage);
            MessageToast.show(hdrMessageObject);
            that.dialogClose();
          },
          error: function(oError) {
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
            sap.ui.core.BusyIndicator.hide(0);
          }
        });
      }
    });
  }
);
