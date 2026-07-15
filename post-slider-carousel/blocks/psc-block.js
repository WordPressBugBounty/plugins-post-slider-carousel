( function( wp ) {

	var el = wp.element.createElement;
	var __ = wp.i18n.__;
	var registerBlockType = wp.blocks.registerBlockType;
	var blockEditor = wp.blockEditor || wp.editor;
	var InspectorControls = blockEditor.InspectorControls;
	var PanelBody = wp.components.PanelBody;
	var RadioControl = wp.components.RadioControl;
	var ToggleControl = wp.components.ToggleControl;

	var data = window.pscBlockData || {};
	var sliderData = data.slider || {};
	var gridData = data.grid || {};

	var pillColors = {
		blue:  { bg: '#eef4fd', border: '#c6dcf8', text: '#1e4e8c' },
		green: { bg: '#e6f6ec', border: '#bfe6cd', text: '#1a6e3c' },
		gray:  { bg: '#f3f4f5', border: '#dcdcde', text: '#50575e' }
	};

	function pill( text, color ) {
		var c = pillColors[ color ] || pillColors.blue;
		return el( 'span', {
			style: {
				display: 'inline-block',
				padding: '4px 14px',
				margin: '4px',
				background: c.bg,
				border: '1px solid ' + c.border,
				color: c.text,
				borderRadius: '999px',
				fontSize: '13px',
				lineHeight: '1.4'
			}
		}, text );
	}

	function onOffPill( label, isOn ) {
		return pill( label + ': ' + ( isOn ? __( 'On', 'post-slider-carousel' ) : __( 'Off', 'post-slider-carousel' ) ), isOn ? 'green' : 'gray' );
	}

	function sliderPills() {
		return [
			el( 'div', { key: 'row1' },
				pill( __( 'Posts', 'post-slider-carousel' ) + ': ' + ( sliderData.posts || __( 'All', 'post-slider-carousel' ) ), 'blue' ),
				pill( __( 'Sort', 'post-slider-carousel' ) + ': ' + ( sliderData.sort || 'date' ), 'blue' ),
				pill( __( 'Visible', 'post-slider-carousel' ) + ': ' + ( sliderData.visible || '3' ), 'blue' ),
				pill( __( 'Size', 'post-slider-carousel' ) + ': ' + ( sliderData.size || __( 'Auto', 'post-slider-carousel' ) ), 'blue' )
			),
			el( 'div', { key: 'row2' },
				onOffPill( __( 'Caption', 'post-slider-carousel' ), sliderData.caption ),
				onOffPill( __( 'Autoplay', 'post-slider-carousel' ), sliderData.auto ),
				onOffPill( __( 'Loop', 'post-slider-carousel' ), sliderData.loop )
			)
		];
	}

	function gridPills() {
		return [
			el( 'div', { key: 'row1' },
				pill( __( 'Columns', 'post-slider-carousel' ) + ': ' + ( gridData.cols || '4' ), 'blue' ),
				pill( __( 'Posts', 'post-slider-carousel' ) + ': ' + ( gridData.posts || __( 'All', 'post-slider-carousel' ) ), 'blue' ),
				pill( __( 'Sort', 'post-slider-carousel' ) + ': ' + ( gridData.sort || 'date' ), 'blue' )
			),
			el( 'div', { key: 'row2' },
				onOffPill( __( 'Pagination', 'post-slider-carousel' ), gridData.pager )
			)
		];
	}

	// When the Pro add-on is active it registers its own, more capable block. Keep
	// this one registered so existing blocks still render and edit, but take it out
	// of the inserter so people are not choosing between two near identical entries.
	var pscProActive = ( typeof pscBlockData !== 'undefined' ) && !! pscBlockData.proActive;

	registerBlockType( 'i13/post-slider-grid-free', {

		title: __( 'Post Slider & Grid', 'post-slider-carousel' ),
		description: __( 'Display your posts as a responsive thumbnail slider or a post grid.', 'post-slider-carousel' ),
		icon: 'slides',
		category: 'widgets',
		keywords: [ __( 'post slider' ), __( 'carousel' ), __( 'post grid' ) ],
		supports: {
			inserter: ! pscProActive
		},

		attributes: {
			displayType: {
				type: 'string',
				default: 'slider'
			},
			related: {
				type: 'boolean',
				default: false
			}
		},

		edit: function( props ) {

			var displayType = props.attributes.displayType;
			var isGrid = ( 'grid' === displayType );
			var settingsUrl = isGrid ? data.gridSettingsUrl : data.sliderSettingsUrl;

			var inspector = el( InspectorControls, { key: 'inspector' },
				el( PanelBody, { title: __( 'Display', 'post-slider-carousel' ), initialOpen: true },
					el( RadioControl, {
						label: __( 'Show as', 'post-slider-carousel' ),
						selected: displayType,
						options: [
							{ label: __( 'Post slider', 'post-slider-carousel' ), value: 'slider' },
							{ label: __( 'Post grid', 'post-slider-carousel' ), value: 'grid' }
						],
						onChange: function( value ) {
							props.setAttributes( { displayType: value } );
						}
					} ),
					el( 'p', { style: { marginTop: '8px' } },
						el( 'a', { href: settingsUrl, target: '_blank', rel: 'noopener noreferrer' },
							isGrid ? __( 'Open grid settings', 'post-slider-carousel' ) : __( 'Open slider settings', 'post-slider-carousel' )
						)
					)
				),
				el( PanelBody, { title: __( 'Related posts', 'post-slider-carousel' ), initialOpen: false },
					el( ToggleControl, {
						label: __( 'Show posts related to the current post', 'post-slider-carousel' ),
						checked: !! props.attributes.related,
						onChange: function( value ) {
							props.setAttributes( { related: value } );
						}
					} ),
					el( 'p', { style: { color: '#757575', fontSize: '12px' } },
						__( 'Matches the categories of the post being viewed and hides itself anywhere that is not a single post.', 'post-slider-carousel' )
					),
					props.attributes.related && el( 'p', { style: { fontSize: '12px' } },
						el( 'a', { href: data.proUrl, target: '_blank', rel: 'noopener noreferrer', style: { color: '#8524de' } },
							__( 'Match by tags, sort by relevance, or auto insert below every post with Pro', 'post-slider-carousel' ) + ' \u2192'
						)
					)
				),
				el( PanelBody, { title: __( 'Pro version', 'post-slider-carousel' ), initialOpen: false },
					el( 'ul', { style: { margin: '0 0 12px', paddingLeft: '18px' } },
						el( 'li', {}, __( 'Unlimited sliders & grids', 'post-slider-carousel' ) ),
						el( 'li', {}, __( 'Vertical slider & ticker mode', 'post-slider-carousel' ) ),
						el( 'li', {}, __( 'Ajax pagination in grids', 'post-slider-carousel' ) ),
						el( 'li', {}, __( 'Masonry, Overlay & Magazine layouts', 'post-slider-carousel' ) ),
						el( 'li', {}, __( 'Social sharing buttons', 'post-slider-carousel' ) ),
						el( 'li', {}, __( '16 easing effects', 'post-slider-carousel' ) )
					),
					el( 'a', { href: data.proUrl, target: '_blank', rel: 'noopener noreferrer', style: { fontWeight: '600' } },
						__( 'Upgrade to Pro', 'post-slider-carousel' ) + ' \u2192'
					)
				)
			);

			var placeholder = el( 'div', {
				key: 'preview',
				style: {
					textAlign: 'center',
					padding: '28px 16px',
					background: '#fbfbfb',
					border: '1px solid #e0e0e0',
					borderRadius: '4px'
				}
			},
				el( 'span', {
					className: 'dashicons ' + ( isGrid ? 'dashicons-grid-view' : 'dashicons-slides' ),
					style: { fontSize: '40px', width: '40px', height: '40px', color: '#8c8f94' }
				} ),
				el( 'div', {
					style: { fontWeight: '600', fontSize: '16px', margin: '10px 0 14px', color: '#1e1e1e' }
				}, props.attributes.related
					? ( isGrid ? __( 'Related Posts Grid', 'post-slider-carousel' ) : __( 'Related Posts Slider', 'post-slider-carousel' ) )
					: ( isGrid ? __( 'Post Grid', 'post-slider-carousel' ) : __( 'Post Slider', 'post-slider-carousel' ) ) ),
				props.attributes.related && el( 'div', {},
					pill( __( 'Related', 'post-slider-carousel' ) + ': ' + __( 'by category', 'post-slider-carousel' ), 'green' ),
					pill( __( 'Posts', 'post-slider-carousel' ) + ': ' + ( data.relatedCount || 4 ), 'blue' )
				),
				( isGrid && data.filterDefault && ! props.attributes.related ) && el( 'div', {},
					pill( __( 'Category filter tabs', 'post-slider-carousel' ) + ': ' + __( 'on', 'post-slider-carousel' ), 'green' )
				),
				isGrid ? gridPills() : sliderPills(),
				el( 'p', {
					style: { color: '#757575', fontSize: '13px', margin: '14px 0 6px' }
				}, ( isGrid
						? __( 'Grid renders on the frontend. Use the sidebar or the settings page to configure it.', 'post-slider-carousel' )
						: __( 'Slider renders on the frontend. Use the sidebar or the settings page to configure it.', 'post-slider-carousel' ) )
				),
				el( 'p', { style: { fontSize: '13px', margin: '0', color: '#8524de' } },
					__( 'Want unlimited sliders, vertical mode, and Ajax pagination?', 'post-slider-carousel' ) + ' ',
					el( 'a', {
						href: data.proUrl,
						target: '_blank',
						rel: 'noopener noreferrer',
						style: { color: '#8524de', fontWeight: '600', textDecoration: 'none' }
					}, __( 'See Pro', 'post-slider-carousel' ) + ' \u2192' )
				)
			);

			return [ inspector, placeholder ];
		},

		save: function() {
			return null;
		}
	} );

} )( window.wp );
