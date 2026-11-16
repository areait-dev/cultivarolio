<?php
/**
 * Plugin Name: Cultivar – setup headless
 * Description: CPT, tassonomia, regola ACF "Slug pagina", CORS, hardening, revalidate on-demand e pulsante "Vedi nel frontend".
 * Version: 1.0.0
 *
 * Da copiare in wp-content/mu-plugins/ (insieme a headless-redirect.php).
 *
 * Costanti da definire in wp-config.php (prima di "That's all, stop editing!"):
 *   define( 'NEXT_URL', 'https://cultivarolio.it' );          // dominio pubblico del frontend, senza slash finale
 *   define( 'WP_REVALIDATE_TOKEN', '…' );                      // = WP_REVALIDATE_TOKEN di Vercel
 *   define( 'WP_PREVIEW_SECRET', '…' );                        // = WP_PREVIEW_SECRET di Vercel
 *
 * Requisiti: ACF FREE (5.9+) e Yoast SEO. Nessun altro plugin: i CPT si registrano qui, non con CPT UI.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** SEGNAPOSTO: se NEXT_URL non è definita in wp-config.php si usa questo dominio. Sostituire (README-MIGRAZIONE.md). */
const CULTIVAR_cultivarolio.it = 'cultivarolio.it';

/** Tipi di contenuto che fanno rigenerare il frontend. */
const CULTIVAR_TIPI_REVALIDATE = array( 'articolo', 'documentario', 'page' );

/* -------------------------------------------------------------------------
 * Utilità
 * ---------------------------------------------------------------------- */

function cultivar_next_url() {
	if ( defined( 'NEXT_URL' ) && NEXT_URL ) {
		return rtrim( NEXT_URL, '/' );
	}
	return 'https://' . CULTIVAR_cultivarolio.it;
}

/** Origini a cui è permesso leggere la REST dal browser. Mai "*". */
function cultivar_allowed_origins() {
	$origini = array( 'http://localhost:3000', cultivar_next_url() );
	return apply_filters( 'cultivar_allowed_origins', array_values( array_unique( $origini ) ) );
}

/** Slug delle pagine WordPress → percorso pubblico (stessa mappa di src/lib/paths.ts). */
function cultivar_mappa_pagine() {
	return array(
		'home'            => '/',
		'il-progetto'     => '/il-progetto',
		'documentari'     => '/documentari',
		'blog'            => '/blog',
		'contatti'        => '/contatti',
		'privacy'         => '/privacy',
		'cookie'          => '/cookie',
		'opzioni-globali' => '/',
	);
}

/* -------------------------------------------------------------------------
 * ACF: cartella JSON e regola di posizione "Slug pagina"
 * ---------------------------------------------------------------------- */

// I field group versionati in /acf-json si copiano in wp-content/acf-json e si attivano con "Sync".
add_filter(
	'acf/settings/load_json',
	function ( $percorsi ) {
		$percorsi[] = WP_CONTENT_DIR . '/acf-json';
		return $percorsi;
	}
);
add_filter(
	'acf/settings/save_json',
	function () {
		return WP_CONTENT_DIR . '/acf-json';
	}
);

// Regola di posizione personalizzata: {"param":"page_slug","operator":"==","value":"home"}.
// Funziona in ACF free (5.9+) e non dipende dagli ID delle pagine, quindi vale su ogni ambiente.
add_action(
	'acf/init',
	function () {
		if ( ! function_exists( 'acf_register_location_type' ) || ! class_exists( 'ACF_Location' ) ) {
			return;
		}

		if ( ! class_exists( 'Cultivar_ACF_Location_Page_Slug' ) ) {
			class Cultivar_ACF_Location_Page_Slug extends ACF_Location {
				public function initialize() {
					$this->name        = 'page_slug';
					$this->label       = __( 'Slug pagina', 'cultivar' );
					$this->category    = 'page';
					$this->object_type = 'post';
				}

				public function get_values( $rule ) {
					$scelte = array();
					$pagine = get_posts(
						array(
							'post_type'      => 'page',
							'post_status'    => array( 'publish', 'draft', 'pending', 'private' ),
							'posts_per_page' => 200,
							'orderby'        => 'title',
							'order'          => 'ASC',
						)
					);
					foreach ( $pagine as $pagina ) {
						if ( '' !== $pagina->post_name ) {
							$scelte[ $pagina->post_name ] = sprintf( '%s (%s)', $pagina->post_title, $pagina->post_name );
						}
					}
					return $scelte;
				}

				public function match( $rule, $screen, $field_group ) {
					$id = isset( $screen['post_id'] ) ? (int) $screen['post_id'] : 0;
					if ( ! $id ) {
						return false;
					}
					$post = get_post( $id );
					if ( ! $post || 'page' !== $post->post_type ) {
						return false;
					}
					$uguale = ( $post->post_name === $rule['value'] );
					return ( '!=' === $rule['operator'] ) ? ! $uguale : $uguale;
				}
			}
		}

		acf_register_location_type( 'Cultivar_ACF_Location_Page_Slug' );
	}
);

/* -------------------------------------------------------------------------
 * Custom post type e tassonomia (REST: /wp/v2/articoli, /documentari, /categorie-articolo)
 * ---------------------------------------------------------------------- */

add_action(
	'init',
	function () {
		register_post_type(
			'articolo',
			array(
				'labels'        => array(
					'name'          => 'Articoli',
					'singular_name' => 'Articolo',
					'add_new_item'  => 'Aggiungi articolo',
					'edit_item'     => 'Modifica articolo',
					'menu_name'     => 'Articoli del blog',
				),
				'public'        => true,
				'has_archive'   => false,
				'show_in_rest'  => true,
				'rest_base'     => 'articoli',
				'menu_icon'     => 'dashicons-media-document',
				'menu_position' => 5,
				'supports'      => array( 'title', 'editor', 'excerpt', 'thumbnail' ),
				'taxonomies'    => array( 'categoria_articolo' ),
				'rewrite'       => array( 'slug' => 'articoli' ),
			)
		);

		register_post_type(
			'documentario',
			array(
				'labels'        => array(
					'name'          => 'Documentari',
					'singular_name' => 'Documentario',
					'add_new_item'  => 'Aggiungi documentario',
					'edit_item'     => 'Modifica documentario',
					'menu_name'     => 'Documentari',
				),
				'public'        => true,
				'has_archive'   => false,
				'show_in_rest'  => true,
				'rest_base'     => 'documentari',
				'menu_icon'     => 'dashicons-video-alt3',
				'menu_position' => 6,
				// Il titolo è la città; "Ordine" (page-attributes) è il numero dell'episodio.
				'supports'      => array( 'title', 'page-attributes' ),
				'rewrite'       => array( 'slug' => 'documentari-wp' ),
			)
		);

		register_taxonomy(
			'categoria_articolo',
			array( 'articolo' ),
			array(
				'labels'            => array(
					'name'          => 'Categorie articolo',
					'singular_name' => 'Categoria articolo',
				),
				'hierarchical'      => true,
				'public'            => true,
				'show_in_rest'      => true,
				'rest_base'         => 'categorie-articolo',
				'show_admin_column' => true,
				'rewrite'           => array( 'slug' => 'categoria-articolo' ),
			)
		);
	}
);

// Termini predefiniti con slug fissi: il frontend li usa per i filtri del blog (/blog?categoria=slug).
add_action(
	'init',
	function () {
		if ( get_option( 'cultivar_termini_v1' ) || ! taxonomy_exists( 'categoria_articolo' ) ) {
			return;
		}
		$termini = array(
			'conoscere-l-olio' => 'Conoscere l’olio',
			'filiera'          => 'Filiera',
			'territori'        => 'Territori',
			'degustazione'     => 'Degustazione',
		);
		foreach ( $termini as $slug => $nome ) {
			if ( ! term_exists( $slug, 'categoria_articolo' ) ) {
				wp_insert_term( $nome, 'categoria_articolo', array( 'slug' => $slug ) );
			}
		}
		update_option( 'cultivar_termini_v1', 1, false );
	},
	20
);

// Le bozze non hanno ancora uno slug: lo si assegna al primo salvataggio, così l'anteprima trova il contenuto.
add_filter(
	'wp_insert_post_data',
	function ( $dati, $postarr ) {
		if (
			in_array( $dati['post_type'], CULTIVAR_TIPI_REVALIDATE, true )
			&& in_array( $dati['post_status'], array( 'draft', 'pending' ), true )
			&& '' === $dati['post_name']
			&& '' !== trim( $dati['post_title'] )
		) {
			$dati['post_name'] = wp_unique_post_slug(
				sanitize_title( $dati['post_title'] ),
				isset( $postarr['ID'] ) ? (int) $postarr['ID'] : 0,
				'publish',
				$dati['post_type'],
				isset( $dati['post_parent'] ) ? (int) $dati['post_parent'] : 0
			);
		}
		return $dati;
	},
	10,
	2
);

/* -------------------------------------------------------------------------
 * CORS: solo origini in whitelist, con Vary: Origin; 204 al preflight
 * ---------------------------------------------------------------------- */

function cultivar_cors_headers() {
	header( 'Vary: Origin', false );
	$origine = get_http_origin();
	if ( $origine && in_array( rtrim( $origine, '/' ), cultivar_allowed_origins(), true ) ) {
		header( 'Access-Control-Allow-Origin: ' . $origine );
		header( 'Access-Control-Allow-Methods: GET, OPTIONS' );
		header( 'Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce' );
		header( 'Access-Control-Max-Age: 600' );
	}
}

function cultivar_uri_rest() {
	$uri = isset( $_SERVER['REQUEST_URI'] ) ? wp_unslash( $_SERVER['REQUEST_URI'] ) : ''; // phpcs:ignore WordPress.Security
	return false !== strpos( $uri, '/wp-json/' ) || isset( $_GET['rest_route'] ); // phpcs:ignore WordPress.Security.NonceVerification
}

// Preflight: risposta vuota 204 prima che WordPress carichi altro.
add_action(
	'init',
	function () {
		$metodo = isset( $_SERVER['REQUEST_METHOD'] ) ? $_SERVER['REQUEST_METHOD'] : '';
		if ( 'OPTIONS' !== $metodo || ! cultivar_uri_rest() ) {
			return;
		}
		cultivar_cors_headers();
		status_header( 204 );
		exit;
	},
	0
);

// Sostituisce l'header CORS predefinito di WordPress (che riflette qualsiasi origine).
add_action(
	'rest_api_init',
	function () {
		remove_filter( 'rest_pre_serve_request', 'rest_send_cors_headers' );
		add_filter(
			'rest_pre_serve_request',
			function ( $servito ) {
				cultivar_cors_headers();
				return $servito;
			}
		);
	},
	99
);

/* -------------------------------------------------------------------------
 * Hardening
 * ---------------------------------------------------------------------- */

add_filter( 'xmlrpc_enabled', '__return_false' );
remove_action( 'wp_head', 'wp_generator' );
add_filter( 'the_generator', '__return_empty_string' );
add_filter(
	'wp_headers',
	function ( $intestazioni ) {
		unset( $intestazioni['X-Pingback'] );
		return $intestazioni;
	}
);

function cultivar_headers_sicurezza() {
	header( 'X-Content-Type-Options: nosniff' );
	header( 'X-Frame-Options: SAMEORIGIN' );
}
add_action( 'send_headers', 'cultivar_headers_sicurezza' );
add_action( 'admin_init', 'cultivar_headers_sicurezza' );
add_filter(
	'rest_post_dispatch',
	function ( $risposta ) {
		if ( $risposta instanceof WP_HTTP_Response ) {
			$risposta->header( 'X-Content-Type-Options', 'nosniff' );
			$risposta->header( 'X-Frame-Options', 'SAMEORIGIN' );
		}
		return $risposta;
	}
);

/* -------------------------------------------------------------------------
 * Revalidate on-demand: WordPress avvisa Next.js quando un contenuto cambia
 * ---------------------------------------------------------------------- */

function cultivar_revalidate( $post ) {
	static $inviati = array();

	if ( ! $post instanceof WP_Post || ! in_array( $post->post_type, CULTIVAR_TIPI_REVALIDATE, true ) ) {
		return;
	}
	if ( wp_is_post_revision( $post ) || wp_is_post_autosave( $post ) || 'auto-draft' === $post->post_status ) {
		return;
	}
	// Una sola chiamata per contenuto e stato nella stessa richiesta
	$chiave = $post->ID . ':' . $post->post_status;
	if ( isset( $inviati[ $chiave ] ) ) {
		return;
	}
	$inviati[ $chiave ] = true;

	if ( ! defined( 'NEXT_URL' ) || ! defined( 'WP_REVALIDATE_TOKEN' ) || ! NEXT_URL || ! WP_REVALIDATE_TOKEN ) {
		error_log( '[cultivar] revalidate saltato: NEXT_URL o WP_REVALIDATE_TOKEN non definiti in wp-config.php' ); // phpcs:ignore
		return;
	}

	$risposta = wp_remote_post(
		cultivar_next_url() . '/api/revalidate',
		array(
			'timeout' => 5,
			'headers' => array(
				'Content-Type'          => 'application/json',
				'X-WP-Revalidate-Token' => WP_REVALIDATE_TOKEN,
			),
			'body'    => wp_json_encode(
				array(
					'post_type' => $post->post_type,
					'slug'      => $post->post_name,
				)
			),
		)
	);

	if ( is_wp_error( $risposta ) ) {
		error_log( '[cultivar] revalidate non riuscito: ' . $risposta->get_error_message() ); // phpcs:ignore
	} elseif ( (int) wp_remote_retrieve_response_code( $risposta ) >= 300 ) {
		error_log( '[cultivar] revalidate: risposta ' . wp_remote_retrieve_response_code( $risposta ) . ' per ' . $post->post_type . '/' . $post->post_name ); // phpcs:ignore
	}
}

// Salvataggi dall'editor classico e da codice. Le richieste REST (editor a blocchi) aspettano
// rest_after_insert_*, quando i campi ACF sono già stati salvati.
add_action(
	'wp_after_insert_post',
	function ( $post_id, $post ) {
		if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
			return;
		}
		if ( 'publish' === $post->post_status ) {
			cultivar_revalidate( $post );
		}
	},
	20,
	2
);

foreach ( CULTIVAR_TIPI_REVALIDATE as $cultivar_tipo ) {
	add_action(
		"rest_after_insert_{$cultivar_tipo}",
		function ( $post ) {
			if ( 'publish' === $post->post_status ) {
				cultivar_revalidate( $post );
			}
		},
		20
	);
}

// Da "pubblicato" a bozza/cestino: la pagina pubblica deve sparire.
// Il passaggio verso "pubblicato" lo gestiscono gli hook sopra, a campi già salvati.
add_action(
	'transition_post_status',
	function ( $nuovo, $vecchio, $post ) {
		if ( 'publish' === $vecchio && 'publish' !== $nuovo ) {
			cultivar_revalidate( $post );
		}
	},
	20,
	3
);

/* -------------------------------------------------------------------------
 * Pulsante "Vedi nel frontend" nella admin bar (anteprima delle bozze)
 * ---------------------------------------------------------------------- */

add_action(
	'admin_bar_menu',
	function ( $barra ) {
		if ( ! defined( 'WP_PREVIEW_SECRET' ) || ! WP_PREVIEW_SECRET ) {
			return;
		}
		$post = null;
		if ( is_admin() ) {
			$schermo = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
			if ( $schermo && 'post' === $schermo->base ) {
				$post = get_post();
			}
		} elseif ( is_singular() ) {
			$post = get_queried_object();
		}
		if ( ! $post instanceof WP_Post || ! in_array( $post->post_type, CULTIVAR_TIPI_REVALIDATE, true ) ) {
			return;
		}
		$indirizzo = add_query_arg(
			array(
				'secret'    => WP_PREVIEW_SECRET,
				'slug'      => $post->post_name,
				'post_type' => $post->post_type,
			),
			cultivar_next_url() . '/api/preview'
		);
		$barra->add_node(
			array(
				'id'    => 'cultivar-vedi-frontend',
				'title' => 'Vedi nel frontend',
				'href'  => $indirizzo,
				'meta'  => array(
					'target' => '_blank',
					'rel'    => 'noopener',
				),
			)
		);
	},
	90
);
