Ext.define('TsGridboardProjectScope', {
    alias: 'plugin.tsgridboardprojectscope',
    extend: 'Ext.Component',
    mixins: [
        'Ext.AbstractPlugin',
        'Rally.ui.gridboard.plugin.GridBoardControlShowable',
    ],

    stateEvents: ['change'],
    value: false,

    initComponent: function() {
        this.callParent(arguments);
        this.addEvents('ready', 'select');
    },

    init: function(cmp) {
        this.cmp = cmp;
        this.showControl();
    },

    getControlCmpConfig: function() {
        return _.merge({
            xtype: 'rallycombobox',
            id: 'ignoreScopeControl',
            cls: 'ts-scope-control',
            stateful: false,
            displayField: 'text',
            valueField: 'value',
            value: this.value,
            // Don't set initial value with this component or it will override the state
            storeConfig: {
                fields: ['text', 'value'],
                data: [{
                    text: "In Current Project(s)",
                    value: false
                }, {
                    text: "In Any Project",
                    value: true
                }]
            },
            listeners: {
                scope: this,
                change: function(combobox, newValue) {
                    this.value = newValue
                    this.saveState(); // Force a state save before callers notified
                    this.cmp.fireEvent('viewstatesave', this); // This gets buffered
                    var me = this;
                    // Work around an issue where this component doesn't reliably reset saved view
                    setTimeout(function() {
                        me.fireEvent('select', newValue);
                    }, 100)
                },
            },
            removeCls: function(cls) {
                var me = this,
                    el = me.rendered ? me.el : me.protoEl;
                // Workaround bug where there is no el or protoEl for this control cmp
                if (el) {
                    el.removeCls.apply(el, arguments);
                }
                return me;
            },
        }, this.controlConfig)
    },

    initState: function() {
        this.callParent(arguments);
        this.fireEvent('ready', this);
    },

    getState: function() {
        var controlCmp = this.getControlCmp();
        var result = {
            scope: this.value
        }
        if (controlCmp) {
            result = {
                scope: controlCmp.getValue()
            }
        }
        return result;
    },

    applyState: function(state) {
        this.value = state['scope'];
        var controlCmp = this.getControlCmp();
        if (controlCmp) {
            controlCmp.setValue(this.value);
        }
    },

    getCurrentView: function() {
        return this.getState();
    },

    setCurrentView: function(view) {
        var combobox = this.getControlCmp(),
            stateId = this.getStateId(),
            state = _.pick(view, 'scope');

        Ext.applyIf(state, this.getState());
        Ext.state.Manager.set(stateId, state);
    },

    getValue: function() {
        return this.value;
    }
});
