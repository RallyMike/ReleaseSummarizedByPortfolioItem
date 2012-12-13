
var query = {
    "__At": "current",
    "_TypeHierarchy":"HierarchicalRequirement",
    "Children":null,
    "_ItemHierarchy":7689990600
};
var find = ["ObjectID","_UnformattedID", "Name","Release"];
var queryString = Ext.JSON.encode(query);
Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    layout: {
        type: 'vbox',
        align: 'stretch'
    },
    items:[
        {
            region:'north',
            height:30,
            xtype:'container',
            layout:'hbox',
            itemId:'header'
        },
        {
            xtype: 'panel',
            layout: 'anchor',
            border: true,
            fieldDefaults: {
                labelWidth: 40
            },
            defaultType: 'textfield',
            bodyPadding: 5,
            
            
            buttons: [
                {
                    xtype: 'rallybutton',
                    text: 'Go',
                    itemId: 'goButton'
                }
            ]
        },
        {
            xtype: 'panel',
            itemId: 'gridHolder',
            layout: 'fit',
            height: 400
        }
    ],

    getAllStoriesByReleaseName:function(name,callback){
        var store = Ext.create('Rally.data.WsapiDataStore', {
            model: 'User Story',
            listeners: {
                load: function(store, data, success) {
                    console.log("data",data);
                    callback()
                }
            },
            fetch: ["Name","Release"],
            filters: [
                {
                    property: 'Release.Name',
                    value: name
                }
            ],
            //90% sure this works -cf
            // If stories are missing for a release
            context: {
                project: null
            },

            autoLoad:true
        });
    },


    launch: function() {

        this.down('#header').add(

            {
                xtype: 'rallyreleasecombobox',
                itemId: 'rlsComboBox',
                width: 300,
                listeners:{
                    change:function(combo) {
                        console.log(combo.getRecord().get("Name"));
                        this.getAllStoriesByReleaseName(combo.getRecord().get("Name"),function(){});
                        //this._getStoriesInRls(combo.getValue());
                    },
                    ready:function(combo) {
                        //debugger;
                        console.log(combo.getValue());
                        //this._getStoriesInRls(combo.getValue());
                    },
                    scope:this
                } // end listeners

            } // end array added to header

        ); // end this.down.add items

        var button = this.down('#goButton');
        button.on('click', this.goClicked, this);
    },
    
    goClicked: function(){
        var transformStore = Ext.create('Rally.data.lookback.SnapshotStore', {
            context: {
                workspace: this.context.getWorkspace(),
                project: this.context.getProject()
            },
            fetch: find,
            rawFind: query,
            autoLoad: true,
            listeners: {
                scope: this,
                load: this.processSnapshots
            }
        });
    },

    
    processSnapshots: function(store, records){
        var snapshotGrid = Ext.create('Rally.ui.grid.Grid', {
            title: 'Snapshots',
            store: store,
            columnCfgs: [
                {
                    text: 'ObjectID', 
                    dataIndex: 'ObjectID'
                },
                {
                    text: 'Name', 
                    dataIndex: 'Name'
                },
                {
                    text: 'Project',
                    dataIndex: 'Project' 
                },
                {
                    text: '_UnformattedID',
                    dataIndex: '_UnformattedID'
                },
                ,
                {
                    text: 'Release',
                    dataIndex: 'Release'
                }
            ],
            height: 400
        });
        
        var gridHolder = this.down('#gridHolder');
        gridHolder.removeAll(true);
        gridHolder.add(snapshotGrid);
    }
});
