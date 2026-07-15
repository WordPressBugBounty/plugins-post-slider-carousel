/**
 * Post Sliders & Post Grids - category filter tabs.
 *
 * Progressive enhancement: without JavaScript the buttons do nothing and the
 * unfiltered grid is still shown, so the page is never broken.
 */
( function ( $ ) {
	'use strict';

	if ( typeof psc_filter_vars === 'undefined' ) {
		return;
	}

	/**
	 * The grid markup returned by the AJAX call contains its own <style> block and
	 * an inline <script> that initialises wrecker. Scripts inserted via .html() do
	 * run, but the wrecker init fires before the new nodes are laid out, so we
	 * re-run it ourselves after swapping.
	 */
	function reinitGrid( $container ) {

		if ( ! $container.length ) {
			return;
		}

		// Only the default layout uses wrecker; the CSS layouts must not be touched.
		var isDefault = $container.hasClass( 'psc_style_default' );

		if ( isDefault && $.fn.wrecker ) {
			var cols = parseInt( $container.data( 'cols' ), 10 ) || 4;
			$container.wrecker( {
				itemSelector: '.item___',
				maxColumns: cols,
				responsiveColumns: [
					{ 1024: parseInt( $container.data( 'cols1024' ), 10 ) || 3 },
					{ 800: parseInt( $container.data( 'cols800' ), 10 ) || 2 },
					{ 640: parseInt( $container.data( 'cols640' ), 10 ) || 1 }
				]
			} );
		}

		$container.removeClass( 'psc_grid_hidden' );
	}

	$( document ).on( 'click', '.psc_filter_btn', function ( event ) {

		event.preventDefault();

		var $btn = $( this );

		if ( $btn.hasClass( 'psc_filter_active' ) || $btn.is( '[disabled]' ) ) {
			return;
		}

		var $bar = $btn.closest( '.psc_filter_bar' );
		var uid = $bar.data( 'grid' );
		var $container = $( '#container' + uid );
		var term = parseInt( $btn.data( 'term' ), 10 ) || 0;

		if ( ! $container.length ) {
			return;
		}

		$bar.addClass( 'psc_loading' );
		$container.addClass( 'psc_loading' );
		$bar.find( '.psc_filter_btn' ).attr( 'disabled', 'disabled' );

		$.ajax( {
			url: psc_filter_vars.ajaxurl,
			type: 'POST',
			data: {
				action: 'psc_filter_grid',
				nonce: psc_filter_vars.nonce,
				psc_term: term
			}
		} )
			.done( function ( response ) {

				if ( ! response || ! response.success || ! response.data || ! response.data.html ) {
					return;
				}

				// The response is a full grid render: filter bar + container. Take only
				// the container so the bar (and its focus) is preserved.
				var $fresh = $( '<div>' ).html( response.data.html );
				var $newContainer = $fresh.find( '.psc_grid_container' ).first();

				if ( ! $newContainer.length ) {
					return;
				}

				// Each render calls uniqid(), so the fresh markup carries a different
				// container id. Keep the original id (and its data attributes) so the
				// bar's data-grid reference and any scoped CSS still match.
				$newContainer.attr( 'id', 'container' + uid );

				// The server also emits a <style> block scoped to the NEW id, which we
				// just discarded. Copy nothing: the page already has styles for this id.
				$container.replaceWith( $newContainer );

				$bar.find( '.psc_filter_btn' ).removeClass( 'psc_filter_active' );
				$btn.addClass( 'psc_filter_active' );

				reinitGrid( $( '#container' + uid ) );
			} )
			.always( function () {

				$bar.removeClass( 'psc_loading' );
				$bar.find( '.psc_filter_btn' ).removeAttr( 'disabled' );
				$( '#container' + uid ).removeClass( 'psc_loading' );
			} );
	} );

	// Keyboard support: the tabs are real buttons, so Enter/Space already work.
	// Expose the active tab to assistive technology.
	$( document ).on( 'click', '.psc_filter_btn', function () {
		var $bar = $( this ).closest( '.psc_filter_bar' );
		$bar.find( '.psc_filter_btn' ).attr( 'aria-pressed', 'false' );
		$( this ).attr( 'aria-pressed', 'true' );
	} );
} )( jQuery );
