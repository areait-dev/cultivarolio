<?php
/**
 * Plugin Name: Cultivar – headless redirect
 * Description: WordPress serve solo da CMS. Il frontend pubblico viene rediretto (301) al dominio del sito Next.js e ogni risposta è noindex.
 * Version: 1.0.0
 *
 * Da copiare in wp-content/mu-plugins/ (insieme a cultivar-setup.php).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Il dominio del frontend: NEXT_URL di wp-config.php; altrimenti il dominio di produzione.
if ( ! function_exists( 'cultivar_redirect_base' ) ) {
	function cultivar_redirect_base() {
		if ( defined( 'NEXT_URL' ) && NEXT_URL ) {
			return rtrim( NEXT_URL, '/' );
		}
		return 'https://cultivarolio.it';
	}
}

/** Slug pagina WordPress → percorso pubblico (stessa mappa di src/lib/paths.ts). */
function cultivar_redirect_percorso() {
	$pagine = array(
		'home'            => '/',
		'il-progetto'     => '/il-progetto',
		'documentari'     => '/documentari',
		'blog'            => '/blog',
		'contatti'        => '/contatti',
		'privacy'         => '/privacy',
		'cookie'          => '/cookie',
		'opzioni-globali' => '/',
	);

	if ( is_singular( 'articolo' ) ) {
		return '/blog/' . get_queried_object()->post_name;
	}
	if ( is_singular( 'documentario' ) ) {
		return '/documentari#' . get_queried_object()->post_name;
	}
	if ( is_page() ) {
		$slug = get_queried_object() ? get_queried_object()->post_name : '';
		return isset( $pagine[ $slug ] ) ? $pagine[ $slug ] : '/';
	}
	return '/';
}

// 301 di tutto il frontend WordPress verso il dominio pubblico.
// Restano fuori: admin, login, ajax, cron, wp-json, rest_route, anteprime e utenti collegati.
add_action(
	'template_redirect',
	function () {
		if ( is_admin() || is_user_logged_in() || wp_doing_ajax() || wp_doing_cron() ) {
			return;
		}
		if ( ( defined( 'REST_REQUEST' ) && REST_REQUEST ) || ( defined( 'XMLRPC_REQUEST' ) && XMLRPC_REQUEST ) ) {
			return;
		}
		if ( isset( $_GET['rest_route'] ) || isset( $_GET['preview'] ) || is_preview() ) { // phpcs:ignore WordPress.Security.NonceVerification
			return;
		}
		$uri = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : ''; // phpcs:ignore WordPress.Security
		if ( preg_match( '#/(wp-login\.php|wp-admin|wp-json|wp-cron\.php|xmlrpc\.php)#', $uri ) ) {
			return;
		}

		wp_redirect( cultivar_redirect_base() . cultivar_redirect_percorso(), 301 ); // phpcs:ignore WordPress.Security.SafeRedirect
		exit;
	},
	1
);

// noindex, nofollow su tutte le risposte: frontend, admin e REST.
function cultivar_header_noindex() {
	header( 'X-Robots-Tag: noindex, nofollow', true );
}
add_action( 'send_headers', 'cultivar_header_noindex' );
add_action( 'admin_init', 'cultivar_header_noindex' );
add_filter(
	'rest_post_dispatch',
	function ( $risposta ) {
		if ( $risposta instanceof WP_HTTP_Response ) {
			$risposta->header( 'X-Robots-Tag', 'noindex, nofollow' );
		}
		return $risposta;
	}
);
add_filter(
	'wp_robots',
	function ( $robots ) {
		$robots['noindex']  = true;
		$robots['nofollow'] = true;
		return $robots;
	}
);
