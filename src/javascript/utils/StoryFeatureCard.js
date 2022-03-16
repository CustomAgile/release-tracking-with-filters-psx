/* globals Ext */
Ext.define('StoryFeatureCard', {
    extend: 'Rally.ui.cardboard.Card',
    alias: 'widget.storyfeaturecard',
    hidden: false,
    lowestPiTypeName: 'Feature',

    initComponent: function() {
        this.hidden = this.isHiddenFunc(this);
        this.callParent(arguments);
        this.feature = this.record.get(this.lowestPiTypeName);
        if (!this.hidden) {
            this.on('ready', this._onReady, this);
        }
    },

    setupPlugins: function() {
        return [
            { ptype: 'rallycardpopover' },
        ];
    },

    reRender: function(highlight) {
        // Convert reRender calls into a re-render of the primary feature card
        if (this.hidden) {
            var primaryCard = this.getVisibleCard(this);
            primaryCard.reRender(highlight);
            primaryCard._onReady(primaryCard);
        }
        else {
            this.callParent(arguments)
            this._onReady(this);
        }
    },

    _onReady: function(card) {
        var stories = this.getAllFeatureStories(this);
        this.storyCount = stories.length;
        this.acceptedStoryCount = 0;
        this.storiesHaveDependencies = false;
        _.each(stories, function(story) {
            if (story.get('AcceptedDate')) {
                this.acceptedStoryCount = this.acceptedStoryCount + 1
            }

            var predSuc = story.get('PredecessorsAndSuccessors')
            if (predSuc && predSuc.Count) {
                this.storiesHaveDependencies = true
            }
        }, this);
        this.update(this._buildFinalHtml());
        this._addFinalListeners();
    },

    _getFeatureColor: function() {
        var artifactColorDiv = {
            tag: 'div',
            cls: 'ts-artifact-color'
        };
        if (this.feature.DisplayColor) {
            artifactColorDiv.style = {
                backgroundColor: this.feature.DisplayColor
            };
        }
        return Ext.DomHelper.createHtml(artifactColorDiv);
    },

    _buildHtml: function() {
        return this._buildInitialHtml();
    },

    _buildInitialHtml: function() {
        var record = this.getRecord();
        var html = [];
        html.push('<div class="ts-card-table-ct"><table class="ts-card-table"><tr>');
        html.push('<td class="ts-card-content">' + this._getFeatureColor() + '</td>');
        html.push('<td class="ts-card-content"><div class="field-content">' + this.feature.FormattedID + '</div></td>');
        html.push('</tr></table>');
        return html.join('\n');
    },

    _buildFinalHtml: function(stories) {
        var record = this.getRecord();
        var feature = record.get(this.lowestPiTypeName);
        var html = [];
        html.push('<div class="ts-card-table-ct"><table class="ts-card-table"><tr>');

        html.push('<td class="ts-card-content">' + this._getFeatureColor() + '</td>');
        html.push('<td class="ts-card-content ts-formatted-id"><div class="field-content">' + this.feature.FormattedID + '</div></td>');
        html.push('<td class="ts-card-content ts-card-icons">');
        if (this.storiesHaveDependencies) {
            html.push('<span class="field-content FeatureStoriesPredecessorsAndSuccessors icon-children"></span>');
        }
        var featurePred = feature.Predecessors;
        var featureSucc = feature.Successors;
        if ((featurePred && featurePred.Count) || (featureSucc && featureSucc.Count)) {
            html.push('<span class="field-content FeaturePredecessorsAndSuccessors icon-predecessor"></span>');
        }
        html.push('</td>');
        html.push('<td class="ts-card-content ts-accepted-count"><span class="field-content">' + this.acceptedStoryCount + ' / ' + this.storyCount + '</span></td>');
        html.push('</tr></table>');
        return html.join('\n');
    },

    _addFinalListeners: function() {
        var el = this.getEl();
        var table = el.down('.ts-card-table')
        if (table) {
            table.on('click', function(event, target, options) {
                this.fireEvent('story', this);
            }, this);
        }
        var predSucIcon = el.down('.FeatureStoriesPredecessorsAndSuccessors');
        if (predSucIcon) {
            predSucIcon.on('click', function(event, target, options) {
                this.fireEvent('fieldclick', 'FeatureStoriesPredecessorsAndSuccessors', this);
                return false;
            }, this, {
                card: this,
                stopPropagation: true // Prevent stories popup from also showing
            });
        }
        var featurePredSucIcon = el.down('.FeaturePredecessorsAndSuccessors');
        if (featurePredSucIcon) {
            featurePredSucIcon.on('click', function() {
                this.fireEvent('fieldclick', 'FeaturePredecessorsAndSuccessors', this);
                return false;
            }, this, {
                card: this,
                stopPropagation: true // Prevent stories popup from also showing
            });
        }
    }
});
