// common.js — alîkarên piçûk + tema
// Production mode - console.log'ları minimize et
const IS_PRODUCTION = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const DEBUG = !IS_PRODUCTION || (window.location.search.includes('debug=true'));

const log = (...args) => {
  if (DEBUG) console.log(...args);
};
const warn = (...args) => {
  if (DEBUG) console.warn(...args);
};
const error = (...args) => {
  // Error'ları her zaman göster
  console.error(...args);
};

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

const I18N = {
  ku: {
    lang_ku: "Kurdî",
    lang_tr: "Türkçe",
    nav_home: "Serrûpel",
    nav_all: "Hemû",
    nav_add: "Zêdeke",
    nav_sources: "Çavkani",
    nav_contact: "Peywendî",
    nav_admin: "Rêveber",
    nav_login: "Têkev",
    nav_profile: "Profîl",
    nav_logout: "Derketin",
    nav_about: "Derbarê",
    action_open: "Veke",
    action_back: "Vegere",
    action_close: "Betal bike",
    action_save: "Tomar bike",
    action_send: "Bişîne",
    action_shuffle: "Nû bike",
    action_rhythm_video: "Vîdeoya rîtmê",
    action_select_all: "Hemûyan hilbijêre",
    action_approve_all: "Hemûyan pejirîne",
    action_approve_selected: "Hilbijartiyan pejirîne",
    action_reject_selected: "Hilbijartiyan red bike",
    action_delete_all: "Hemûyan jê bibe",
    action_delete_selected: "Hilbijartiyan jê bibe",
    action_add_song: "Stran Nû Zêde Bike",
    action_add_song_short: "Stran Zêde Bike",
    action_login: "Têkeve",
    action_favorite: "Favorî bike",
    seo_site_name: "Repertûara Kurdî",
    seo_home_title: "Repertûara Kurdî | Akorên Stranên Kurdî û Gotinên Stranan",
    seo_home_desc: "Akor û gotinên stranên kurdî bibîne. Repertûara Kurdî bi ton û govend.",
    seo_all_title: "Hemû Stranên Kurdî | Repertûara Kurdî",
    seo_all_desc: "Repertûara Kurdî: hemû stranên kurdî bi akor, gotin, ton û govend.",
    seo_artist_title: "{artist} — Stranên Kurdî û Akor | Repertûara Kurdî",
    seo_artist_desc: "{artist} ji bo gotin, akor, ton û govendên stranên kurdî.",
    seo_song_title: "{song} — {artist} | Gotin û Akor",
    seo_song_desc: "{song} ji {artist}. Gotin, akor, tonê orîjînal û govend.",
    search_placeholder: "Stran an hunermend bigere…",
    search_placeholder_artist: "Di nav stranên vî hunermendî de bigere…",
    home_kicker: "Hûn bi xêr hatin",
    home_title: "Akorên stranên kurdî li yek rûpelê bibîne.",
    home_subtitle: "Bigere, keşf bike, bitikîne, bibîne",
    home_seo_title: "Repertûara Kurdî li yek rûpelê",
    home_seo_text: "Li vir akorên stranên kurdî, gotinên stranên kurdî, tonê orîjînal û govend hene. Repertûara kurdî bi awayekî hêsan ji bo gitarê û muzîkvanan tê amade kirin.",
    home_results_default: "Yên Berçav",
    home_results_search: "Encamên lêgerînê",
    home_results_count: "encam",
    home_refresh: "Nûve bike",
    home_view_all: "Hemûyan Bibîne",
    about_title: "Derbarê Me",
    about_p1: "Evîn û şertên vê malperê ji hewldaneke bi dil û bi muzîkê re hatine avakirin. Armanca me ew e ku akor û repertûara stranên kurdî bi awayekî hêsan, gihandî û hêsabkirî bigihînin hemû kesên ku dixwazin gitarê bi muzîka xwe re bikar bînin. Ev malper ne tenê cihê akoran e; ew hewceyeke parastin û belavkirina bîra muzîka kurdî ye.",
    about_p2: "Di vê rê de, Helezonîk Kreşendo ji bo me çavkaniyeke girîng û hêja bû. Bi awayê wan yê akademîk û bi rêz û şertên wan yên muzîkî, wan rê li pêşiya vê projeyê vekir. Ji bo ku em karibin vê arşîvê bi rêz û bi şertên rast bi giştî re parve bikin, em bi rêz û sipasên xwe bi dil ji wan re radigihînin.",
    about_p3: "Her weha, em bi taybetî spas dikin Serdar Y. Türkmen ku bi zanîn, tecrûbe û xebata xwe ya dirêj di warê muzîka kurdî de, ji bo gelek xwendekar û muzîkvanan bûye çavkaniyek. Bi heman awayî, em spasên xwe ji hemû xwendekarên Med Sanat Merkezi re radigihînin; her yek ji wan bi hewldan û evîna xwe ya bi muzîkê re, beşdariyeke girîng di şertên ku vê projeyê gihandî ye de kiriye. Ev malper bi hevkariya wan, bi rêz û bi vîjdana muzîkî, her roj hîn dibe û fireh dibe.",
    sources_title: "Çavkaniyên",
    sources_subtitle: "Spas ji hevalên me yên ku vê repertuarê parve dikin.",
    contact_title: "Peywendî",
    contact_subtitle: "Tu dikarî repertuara xwe an mijarek din bi me re parve bikî.",
    contact_label_name: "Nav û Paşnav",
    contact_placeholder_name: "Nav û Paşnav",
    contact_label_contact: "Peywendî",
    contact_placeholder_contact: "E-name an telefon",
    contact_label_message: "Peyam",
    contact_placeholder_message: "Kurtî binivîse...",
    contact_label_files: "Pel Zêde Bike",
    contact_status_db_unready: "Danegeh amade nîne.",
    contact_status_sending: "Tê şandin...",
    contact_status_empty: "Ji kerema xwe peyam binivîse an jî pel zêde bike.",
    contact_status_file_too_large: "\"{name}\" pir mezin e. (Max 12MB)",
    contact_status_upload_disabled: "Barkirina pelê çalak nîne.",
    contact_status_sent: "Hate şandin. Spas, em ê di demek nêzîk de vegerin.",
    contact_status_failed: "Peyam nehat şandin.",
    footer_title: "Repertûara Kurdî",
    footer_subtitle: "Repertûara Stranan",
    footer_stats_title: "Repertûar",
    footer_stats_subtitle: "Agahîya Lîsteyê",
    footer_stat_songs: "Stran",
    footer_stat_artists: "Hunermend",
    footer_stat_repertoire: "Repertûar",
    footer_credit: "Developer:<a class=\"footerLink\" href=\"https://x.com/ahmetucarx\" target=\"_blank\" rel=\"noopener noreferrer\">Ahmet Uçar</a>",
    status_loading_songs: "Stran tên barkirinê...",
    status_no_results: "Tınne",
    status_error_prefix: "Çewtî",
    status_song_unavailable: "Stran nehat barkirin. Ji kerema xwe rûpelê nû bike.",
    status_text_missing: "Metin bulunamadı.",
    label_song: "Stran",
    label_artist: "Hunermend",
    label_result: "encam",
    badge_pending_editor: "Li benda pejirandina edîtorê ye",
    badge_pending: "Li benda pejirandinê",
    add_song_title: "Stran Nû Zêde Bike",
    edit_song_title: "Guhartin",
    label_song_name: "Navê stranê",
    label_artist_name: "Navê hunermendê",
    label_key: "Tonê orîjînal",
    label_rhythm_optional: "Govend (opsiyonel)",
    label_text: "Nivîsa stranê",
    placeholder_song_name: "Mînak: Stranên Kurdî",
    placeholder_artist_name: "Mînak: Şivan Perwer",
    placeholder_rhythm: "Mînak: 4/4, Pop 2",
    placeholder_text: "Nivîsa bi akorê li virê bike...",
    key_select_placeholder: "Tonê hilbijêre",
    tooltip_artist: "Navê hunermendê rast binivîse, ji bo ku stran li ser rûpela hunermendê xuya bibe.",
    template_verse: "Verse",
    template_chorus: "Chorus",
    template_bridge: "Bridge",
    chords_label: "Akorlar",
    preview_label: "Önizleme",
    keyboard_hint: "Ctrl+S: Kaydet | Esc: Kapat",
    status_requires_login_favorite: "Ji bo favorî divê tu têkevî.",
    status_requires_login_add: "Ji bo stran zêde kirinê divê tu têkevî.",
    status_requires_login_edit: "Ji bo guhertinê divê tu têkevî.",
    status_text_required: "Nivîsa stranê pêwîst e.",
    status_song_required: "Navê stranê pêwîst e.",
    status_artist_required: "Navê hunermendê pêwîst e.",
    status_key_required: "Tonê orîjînal pêwîst e.",
    status_save_failed: "Nehat tomarkirin.",
    status_saving: "Tomar tê kirin...",
    status_edit_required_fields: "Navê stranê û nivîs pêwîst in.",
    status_edit_saved: "Niha tomar kir. Guhertinên te ji bo pejirandina edîtorê li benda ne. Piştî pejirandinê guhertinên te dê xuya bibin.",
    status_firestore_unready: "Firestore ne amade ye. Ji kerema xwe rûpelê nû bike û dîsa biceribîne.",
    status_firestore_error: "Firestore hatası. Ji kerema xwe rûpelê nû bike û dîsa biceribîne.",
    status_favorite_failed: "Favorî nehat tomarkirin.",
    status_favorite_load_failed: "Favoriler yüklenemedi:",
    search_overlay_clear: "Paqij bike",
    search_overlay_close: "Betal bike",
    search_overlay_no_results: "Encam nehate dîtin",
    search_overlay_results: "Encamên lêgerînê",
    search_overlay_suggestions: "Yên Berçav",
    label_no_title: "Bê nav",
    label_no_artist: "Bê hunermend",
    artist_link_title: "Ji bo dîtina stranên hunermendê bikeve",
    youtube_search: "YouTube'da ara"
    ,
    auth_error_unauthorized_domain: "Ev domain destûr nedaye. Firebase console'ê kontrol bike.",
    auth_error_popup_blocked: "Popup hate astengkirin.",
    auth_error_popup_closed: "Popup hate girtin.",
    auth_error_network: "Girêdana înternetê tune.",
    auth_error_too_many_requests: "Gelek daxwaz. Pişt re bêje.",
    auth_error_user_disabled: "Bikarhêner hate astengkirin.",
    auth_error_user_not_found: "Bikarhêner nehate dîtin.",
    auth_error_wrong_password: "Şîfre çewt e.",
    auth_error_email_in_use: "E-name berê hat qeydkirin.",
    auth_error_weak_password: "Şîfre zêde nerm e.",
    auth_error_invalid_email: "E-name nederbasdar e.",
    auth_error_operation_not_allowed: "Operasyon destûr nedaye.",
    auth_error_requires_recent_login: "Dîsa têkeve.",
    auth_error_credential_in_use: "Kredensiyal berê hat bikaranîn.",
    auth_error_generic: "Çewtiyek çêbû.",
    lang_switcher_label: "Hilbijartina zimanê",
    search_label: "Lêgerîn",
    footer_copyright: "© Repertûara Kurdî",
    footer_copyright_year: "© 2024 Repertûara Kurdî",
    all_title: "Hemû Stran",
    label_count: "Hejmara",
    filter_all: "Hemû",
    filter_pending: "Li benda pejirandinê",
    filter_approved: "Pejirandî",
    filter_rejected: "Redkirî",
    sort_song_asc: "Stran (A → Z)",
    sort_song_desc: "Stran (Z → A)",
    sort_artist_asc: "Hunermend (A → Z)",
    sort_label: "Rêzkirin",
    sort_normal: "Rêzkirin: Asayî",
    sort_az: "Rêzkirin: A–Z",
    action_edit: "Biguherîne",
    song_listen_title: "Stranê guhdarî bike",
    recs_title: "Pêşniyarên",
    song_prev: "Strana berê",
    song_next: "Strana paş",
    label_original_key: "Orjînal:",
    label_current_key: "Niha:",
    label_rhythm: "Govend:",
    admin_title: "Pejirandina Rêveber",
    admin_status_loading: "Li benda têketinê ye…",
    admin_pending_label: "li bendê",
    admin_new_songs: "Stranên nû",
    admin_edits: "Guhartin",
    admin_contact_messages: "Peyamên Peywendiyê",
    label_message: "peyam",
    admin_no_pending: "Ti şandiyên li bendê tune.",
    admin_no_messages: "Hêj peyam tune.",
    label_anonymous: "Bênav",
    label_file: "pel",
    action_approve: "Pejirîne",
    action_reject: "Red bike",
    action_delete: "Jê bibe",
    admin_status_approving: "Pejirandin…",
    admin_status_rejecting: "Redkirin…",
    admin_type_new_song: "Strana nû",
    admin_type_edit: "Guhartin",
    status_firebase_unready: "Firebase amade nîne.",
    status_requires_login: "Têketin pêwîst e.",
    admin_not_authorized: "Yetkîn tune.",
    status_nothing_selected: "Tiştek nehate hilbijartin.",
    admin_status_pending: "Şandiyên li bendê",
    admin_status_no_pending: "Ti şandiyên li bendê tune.",
    admin_status_approved_count: "{count} şandî pejirandî. Cache tê paqijkirin…",
    admin_status_rejected_count: "{count} şandî redkirî.",
    admin_confirm_delete_messages: "{count} peyam jêdibe. Tu piştrast î?",
    admin_status_deleting: "Jêbirin…",
    admin_status_deleted_count: "{count} peyam jêbirî.",
    admin_status_load_failed: "Lîste nehat barkirin: {message}",
    admin_messages_load_failed: "Peyam nehat barkirin: {message}",
    admin_status_render_error: "Render çewtiyek: {message}",
    badge_approved: "Pejirandî",
    badge_rejected: "Redkirî",
    profile_no_favorites: "Hêj favorî tune.",
    profile_no_artist_favorites: "Hêj hunermendê favorî tune.",
    action_remove_favorite: "Ji favoriyan derxe",
    status_requires_login_artist_favorite: "Ji bo favorîkirina hunermendê divê tu têkevî.",
    profile_delete_type_song: "stran",
    profile_delete_type_edit: "guhartin",
    profile_confirm_delete: "Tu dixwazî vê {type} jê bibî? Ev kar bêpaş nabe.",
    profile_not_authorized: "Yetkîn tune an jî ev naverok ji te re nîne.",
    action_deleting: "Jêbirin…",
    profile_delete_permission_denied: "Yetkîn tune. Tenê guhartinên te yên li benda pejirandinê an jî redkirî dikarî jê bibî.",
    profile_firestore_unavailable: "Firestore nehate gihîştin. Ji kerema xwe dîsa biceribîne.",
    profile_subtitle_default: "Agahiyên hesabê",
    profile_photo_label: "URL ya wêneya profîlê",
    profile_fav_songs: "Stranên Favorî",
    profile_fav_artists: "Hunermendên Favorî",
    profile_my_songs: "Stranên min",
    profile_my_edits: "Guhartinên min",
    label_edit: "guhartin",
    profile_auth_unavailable: "Sîstema têketinê nehate dîtin.",
    profile_no_submissions_new: "Hêj stran nehat zêdekirin.",
    profile_no_submissions_edit: "Hêj guhartin tune.",
    confirm_sign_out: "Tu dixwazî derkevî?",
    status_sign_out_failed: "Derketin bi ser neket.",
    status_requires_login_profile: "Divê tu têkevî.",
    profile_photo_updated: "Wêne hate nûkirin.",
    profile_photo_update_failed: "Nehat nûkirin.",
    profile_name_requires_login: "Divê tu têkevî",
    profile_status_logged_out: "Têketin tune",
    profile_subtitle_logged_out: "Ji bo profîlê têkeve.",
    profile_name_fallback: "Bikarhêner",
    profile_subtitle_logged_in: "Hesab û naverokên te",
    action_favorite_artist: "Hunermendê favorî bike",
    action_unfavorite_artist: "Ji favoriyan derxe",
    status_artist_favorited: "Hunermend hate zêdekirin.",
    status_artist_unfavorited: "Hunermend ji favoriyan hat derxistin.",
    status_artist_favorite_failed: "Hunermend favorî nebû.",
    status_artist_load_failed: "Stran nehatin barkirin.",
    key_suggestion: "💡 Pêşniyar: tonê {key}",
    label_char_count: "{count} karakter",
    label_chord_count: "{count} akor",
    validation_invalid_chords: "⚠️ {count} akor ne derbasdar: {list}",
    validation_no_chords: "ℹ️ Akor nehat dîtin",
    validation_format_ok: "✓ Format rast e",
    login_title: "Têketin",
    login_subtitle: "Ji bo stran zêde kirinê divê tu têkevî.",
    login_google: "Bi Google re têketin",
    login_divider_or: "an",
    login_label_email: "E-name",
    login_placeholder_email: "mînak@email.com",
    login_label_password: "Şîfre",
    login_action_sign_in: "Têkev",
    login_action_sign_up: "Tomar bibe",
    login_action_reset: "Şîfreya xwe ji bîr kirî?",
    login_status_signing_in: "Têketin tê kirin...",
    login_status_sign_in_success: "Bi serkeftî têketin! Tê guhertin...",
    login_error_missing_fields: "Ji kerema xwe e-name û şîfre binivîse.",
    login_error_firebase_unready: "Firebase hêj nehate barkirin, ji kerema xwe li benda bimîne...",
    login_error_sign_in_failed: "Têketin bi ser neket. Ji kerema xwe dîsa biceribîne.",
    login_error_user_not_found: "Ev e-name qeyd nebûye. Ji kerema xwe pêşî tomar bibe.",
    login_error_wrong_password: "Şîfre çewt e. Ji kerema xwe dîsa biceribîne.",
    login_error_invalid_credential: "E-name an jî şîfre çewt e. Ger tu qeyd nebûyî, pêşî tomar bibe.",
    login_error_invalid_email: "E-name nederbasdar e. Ji kerema xwe e-nameyek derbasdar binivîse.",
    login_error_too_many_requests: "Zêde hewl hat kirin. Piştî demekê dîsa biceribîne.",
    login_error_network: "Girêdana înternetê tune. Ji kerema xwe kontrol bike.",
    login_error_user_disabled: "Ev hesab hate astengkirin. Ji kerema xwe bi rêveberiyê re têkilî daynin.",
    login_error_operation_not_allowed: "Ev awayê têketinê destûr nedaye. Ji kerema xwe bi rêveberiyê re têkilî daynin.",
    login_error_generic: "Çewtiyek çêbû.",
    login_error_password_length: "Şîfre divê herî kêm 6 karakter be.",
    login_status_signing_up: "Tomar tê kirin...",
    login_status_sign_up_success: "Bi serkeftî tomar bû! Tê guhertin...",
    login_error_sign_up_failed: "Tomar bi ser neket. Ji kerema xwe dîsa biceribîne.",
    login_error_email_in_use: "Ev e-name jixwe qeyd bûye. Ger ev e-nameya te ye, têkev.",
    login_error_weak_password: "Şîfre pir hêsan e. Divê herî kêm 6 karakter be.",
    login_status_google_signing_in: "Bi Google re têketin tê kirin...",
    login_status_google_success: "Bi serkeftî têketin! Tê guhertin...",
    login_error_google_failed: "Bi Google re têketin bi ser neket. Ji kerema xwe dîsa biceribîne.",
    login_error_popup_closed: "Giriş vekirî bû.",
    login_error_popup_blocked: "Popup hate astengkirin. Ji kerema xwe popup destûrê bide.",
    login_error_unauthorized_domain: "Ev domain destûr nedaye. Firebase console'ê kontrol bike.",
    login_status_reset_sending: "E-nameyê tê şandin...",
    login_status_reset_sent: "E-nameyê şand! Posta quteya xwe kontrol bike.",
    login_error_reset_missing_email: "Ji kerema xwe e-nameyê binivîse.",
    login_error_reset_failed: "E-name şandina bi ser neket. Ji kerema xwe dîsa biceribîne.",
    login_error_reset_user_not_found: "Ev e-name qeyd nebûye.",
    login_error_reset_invalid_email: "E-name nederbasdar e.",
    login_error_reset_invalid_credential: "E-name nederbasdar e. Ji kerema xwe kontrol bike.",
    login_error_firebase_load_failed: "Firebase nehate barkirin. Ji kerema xwe rûpelê nû bike."
  },
  tr: {
    lang_ku: "Kürtçe",
    lang_tr: "Türkçe",
    nav_home: "Ana Sayfa",
    nav_all: "Tümü",
    nav_add: "Ekle",
    nav_sources: "Kaynaklar",
    nav_contact: "İletişim",
    nav_admin: "Yönetici",
    nav_login: "Giriş",
    nav_profile: "Profil",
    nav_logout: "Çıkış",
    nav_about: "Hakkımızda",
    action_open: "Aç",
    action_back: "Geri",
    action_close: "Kapat",
    action_save: "Kaydet",
    action_send: "Gönder",
    action_shuffle: "Yenile",
    action_rhythm_video: "Ritim videosu",
    action_select_all: "Tümünü seç",
    action_approve_all: "Tümünü onayla",
    action_approve_selected: "Seçileni onayla",
    action_reject_selected: "Seçileni reddet",
    action_delete_all: "Tümünü sil",
    action_delete_selected: "Seçileni sil",
    action_add_song: "Yeni Şarkı Ekle",
    action_add_song_short: "Şarkı Ekle",
    action_login: "Giriş",
    action_favorite: "Favoriye ekle",
    seo_site_name: "Repertuar Kürdi",
    seo_home_title: "Kürtçe Akorlar | Repertuar Kürdi - Kürtçe Şarkı Sözleri",
    seo_home_desc: "Kürtçe akorlar ve Kürtçe şarkı sözleri burada. Orijinal ton ve ritim bilgileriyle Kürtçe repertuar.",
    seo_all_title: "Kürtçe Akorlar ve Tüm Şarkılar | Repertuar Kürdi",
    seo_all_desc: "Kürtçe akorlar, şarkı sözleri, ton ve ritim bilgileri. Kürtçe şarkı akorları repertuarı.",
    seo_artist_title: "{artist} — Kürtçe Şarkılar ve Akorlar | Repertuar Kürdi",
    seo_artist_desc: "{artist} için kürtçe şarkı sözleri, akorlar ve repertuar.",
    seo_song_title: "{song} sözleri ve akorları — {artist} | Repertuar Kürdi",
    seo_song_desc: "{song} {artist} kürtçe sözleri, akorları, orijinal ton ve ritim bilgisi.",
    search_placeholder: "Şarkı veya sanatçı ara…",
    search_placeholder_artist: "Bu sanatçının şarkılarında ara…",
    home_kicker: "Hoş geldin",
    home_title: "Kürtçe akorları tek sayfada bul.",
    home_subtitle: "Ara, keşfet, tıkla, gör",
    home_seo_title: "Kürtçe şarkı akorları ve sözleri",
    home_seo_text: "Repertuar Kürdi’de kürtçe şarkı akorları, kürtçe şarkı sözleri, orijinal ton ve ritim bilgileri var. Kürtçe repertuarı gitar ve müzik için tek yerde topluyoruz.",
    home_results_default: "Öne Çıkanlar",
    home_results_search: "Arama Sonuçları",
    home_results_count: "sonuç",
    home_refresh: "Yenile",
    home_view_all: "Hepsini Gör",
    about_title: "Hakkımızda",
    about_p1: "Bu sitenin ruhu ve şartları, yürekle ve müzikle verilen bir emekle kuruldu. Amacımız, Kürtçe şarkıların akor ve repertuarını gitarını kendi müziğiyle kullanmak isteyen herkese kolay, erişilebilir ve anlaşılır biçimde ulaştırmak. Bu site yalnızca akorların olduğu bir yer değil; Kürt müziğinin hafızasını koruma ve yayma ihtiyacıdır.",
    about_p2: "Bu yolda Helezonîk Kreşendo bizim için önemli ve değerli bir kaynak oldu. Akademik yaklaşımları ve müzikal disiplinleriyle bu projenin önünü açtılar. Bu arşivi doğru ve saygılı biçimde paylaşabilmemiz için emek veren tüm ekibe içten teşekkür ediyoruz.",
    about_p3: "Ayrıca özellikle Serdar Y. Türkmen’e teşekkür ediyoruz; Kürt müziği alanındaki bilgi, tecrübe ve uzun yıllara dayanan emeğiyle pek çok öğrenci ve müzisyen için kaynak olmuştur. Aynı şekilde Med Sanat Merkezi’nin tüm öğrencilerine teşekkür ederiz; her biri müziğe olan emek ve sevgisiyle bu projenin oluşmasına önemli katkı sundu. Bu site onların ortaklığı, saygısı ve müzikal vicdanıyla her gün büyüyor ve gelişiyor.",
    sources_title: "Kaynaklar",
    sources_subtitle: "Repertuarı paylaşan dostlarımıza teşekkürler.",
    contact_title: "İletişim",
    contact_subtitle: "Repertuarını veya başka bir konuyu bizimle paylaşabilirsin.",
    contact_label_name: "Ad Soyad",
    contact_placeholder_name: "Ad Soyad",
    contact_label_contact: "İletişim",
    contact_placeholder_contact: "E-posta veya telefon",
    contact_label_message: "Mesaj",
    contact_placeholder_message: "Kısaca yaz...",
    contact_label_files: "Dosya Ekle",
    contact_status_db_unready: "Veritabanı hazır değil.",
    contact_status_sending: "Gönderiliyor...",
    contact_status_empty: "Lütfen mesaj yazın veya dosya ekleyin.",
    contact_status_file_too_large: "\"{name}\" çok büyük. (Max 12MB)",
    contact_status_upload_disabled: "Dosya yükleme devre dışı.",
    contact_status_sent: "Gönderildi. Teşekkürler, en kısa sürede döneceğiz.",
    contact_status_failed: "Mesaj gönderilemedi.",
    footer_title: "Repertûara Kurdî",
    footer_subtitle: "Şarkı Repertuarı",
    footer_stats_title: "Repertuar",
    footer_stats_subtitle: "Liste Bilgisi",
    footer_stat_songs: "Şarkı",
    footer_stat_artists: "Sanatçı",
    footer_stat_repertoire: "Repertuar",
    footer_credit: "Developer:<a class=\"footerLink\" href=\"https://x.com/ahmetucarx\" target=\"_blank\" rel=\"noopener noreferrer\">Ahmet Uçar</a>",
    status_loading_songs: "Şarkılar yükleniyor...",
    status_no_results: "Bulunamadı",
    status_error_prefix: "Hata",
    status_song_unavailable: "Şarkı yüklenemedi. Lütfen sayfayı yenileyin.",
    status_text_missing: "Metin bulunamadı.",
    label_song: "Şarkı",
    label_artist: "Sanatçı",
    label_result: "sonuç",
    badge_pending_editor: "Editör onayı bekliyor",
    badge_pending: "Onay bekliyor",
    add_song_title: "Yeni Şarkı Ekle",
    edit_song_title: "Düzenleme",
    label_song_name: "Şarkı adı",
    label_artist_name: "Sanatçı adı",
    label_key: "Orijinal ton",
    label_rhythm_optional: "Ritim (opsiyonel)",
    label_text: "Şarkı metni",
    placeholder_song_name: "Örnek: Kürtçe Şarkılar",
    placeholder_artist_name: "Örnek: Şivan Perwer",
    placeholder_rhythm: "Örnek: 4/4, Pop 2",
    placeholder_text: "Akorlu metni buraya yaz...",
    key_select_placeholder: "Ton seç",
    tooltip_artist: "Sanatçı adını doğru yaz, böylece şarkı sanatçı sayfasında görünür.",
    template_verse: "Kıta",
    template_chorus: "Nakarat",
    template_bridge: "Köprü",
    chords_label: "Akorlar",
    preview_label: "Önizleme",
    keyboard_hint: "Ctrl+S: Kaydet | Esc: Kapat",
    status_requires_login_favorite: "Favori için giriş yapmalısın.",
    status_requires_login_add: "Şarkı eklemek için giriş yapmalısın.",
    status_requires_login_edit: "Düzenlemek için giriş yapmalısın.",
    status_text_required: "Şarkı metni gerekli.",
    status_song_required: "Şarkı adı gerekli.",
    status_artist_required: "Sanatçı adı gerekli.",
    status_key_required: "Orijinal ton gerekli.",
    status_save_failed: "Kaydedilemedi.",
    status_saving: "Kaydediliyor...",
    status_edit_required_fields: "Şarkı adı ve metin gerekli.",
    status_edit_saved: "Kaydedildi. Değişikliklerin editör onayı bekliyor. Onaydan sonra görünür.",
    status_firestore_unready: "Firestore hazır değil. Lütfen sayfayı yenileyip tekrar deneyin.",
    status_firestore_error: "Firestore hatası. Lütfen sayfayı yenileyip tekrar deneyin.",
    status_favorite_failed: "Favori kaydedilemedi.",
    status_favorite_load_failed: "Favoriler yüklenemedi:",
    search_overlay_clear: "Temizle",
    search_overlay_close: "Kapat",
    search_overlay_no_results: "Sonuç bulunamadı",
    search_overlay_results: "Arama Sonuçları",
    search_overlay_suggestions: "Öne Çıkanlar",
    label_no_title: "İsimsiz",
    label_no_artist: "Sanatçı yok",
    artist_link_title: "Sanatçı şarkılarını gör",
    youtube_search: "YouTube'da ara"
    ,
    auth_error_unauthorized_domain: "Bu domain yetkili değil. Firebase console'u kontrol edin.",
    auth_error_popup_blocked: "Popup engellendi.",
    auth_error_popup_closed: "Popup kapatıldı.",
    auth_error_network: "İnternet bağlantısı yok.",
    auth_error_too_many_requests: "Çok fazla istek. Biraz sonra deneyin.",
    auth_error_user_disabled: "Kullanıcı devre dışı bırakıldı.",
    auth_error_user_not_found: "Kullanıcı bulunamadı.",
    auth_error_wrong_password: "Şifre hatalı.",
    auth_error_email_in_use: "E-posta zaten kayıtlı.",
    auth_error_weak_password: "Şifre çok zayıf.",
    auth_error_invalid_email: "E-posta geçersiz.",
    auth_error_operation_not_allowed: "İşlem izinli değil.",
    auth_error_requires_recent_login: "Tekrar giriş yapın.",
    auth_error_credential_in_use: "Kimlik bilgisi zaten kullanılıyor.",
    auth_error_generic: "Bir hata oluştu.",
    lang_switcher_label: "Dil seçimi",
    search_label: "Arama",
    footer_copyright: "© Repertûara Kurdî",
    footer_copyright_year: "© 2024 Repertûara Kurdî",
    all_title: "Tüm Şarkılar",
    label_count: "Sayı",
    filter_all: "Tümü",
    filter_pending: "Onay bekliyor",
    filter_approved: "Onaylandı",
    filter_rejected: "Reddedildi",
    sort_song_asc: "Şarkı (A → Z)",
    sort_song_desc: "Şarkı (Z → A)",
    sort_artist_asc: "Sanatçı (A → Z)",
    sort_label: "Sıralama",
    sort_normal: "Sıralama: Varsayılan",
    sort_az: "Sıralama: A–Z",
    action_edit: "Düzenle",
    song_listen_title: "Şarkıyı dinle",
    recs_title: "Öneriler",
    song_prev: "Önceki şarkı",
    song_next: "Sonraki şarkı",
    label_original_key: "Orijinal:",
    label_current_key: "Şimdi:",
    label_rhythm: "Govend:",
    admin_title: "Yönetici Onayı",
    admin_status_loading: "Giriş bekleniyor…",
    admin_pending_label: "bekliyor",
    admin_new_songs: "Yeni şarkılar",
    admin_edits: "Düzenlemeler",
    admin_contact_messages: "İletişim Mesajları",
    label_message: "mesaj",
    admin_no_pending: "Bekleyen gönderi yok.",
    admin_no_messages: "Henüz mesaj yok.",
    label_anonymous: "Anonim",
    label_file: "dosya",
    action_approve: "Onayla",
    action_reject: "Reddet",
    action_delete: "Sil",
    admin_status_approving: "Onaylanıyor…",
    admin_status_rejecting: "Reddediliyor…",
    admin_type_new_song: "Yeni şarkı",
    admin_type_edit: "Düzenleme",
    status_firebase_unready: "Firebase hazır değil.",
    status_requires_login: "Giriş gerekli.",
    admin_not_authorized: "Yetkin yok.",
    status_nothing_selected: "Hiçbir şey seçilmedi.",
    admin_status_pending: "Bekleyen gönderiler",
    admin_status_no_pending: "Bekleyen gönderi yok.",
    admin_status_approved_count: "{count} gönderi onaylandı. Önbellek temizleniyor…",
    admin_status_rejected_count: "{count} gönderi reddedildi.",
    admin_confirm_delete_messages: "{count} mesaj silinecek. Emin misiniz?",
    admin_status_deleting: "Siliniyor…",
    admin_status_deleted_count: "{count} mesaj silindi.",
    admin_status_load_failed: "Liste yüklenemedi: {message}",
    admin_messages_load_failed: "Mesajlar yüklenemedi: {message}",
    admin_status_render_error: "Render hatası: {message}",
    badge_approved: "Onaylandı",
    badge_rejected: "Reddedildi",
    profile_no_favorites: "Henüz favori yok.",
    profile_no_artist_favorites: "Henüz favori sanatçı yok.",
    action_remove_favorite: "Favoriden çıkar",
    status_requires_login_artist_favorite: "Sanatçıyı favorilemek için giriş yapmalısın.",
    profile_delete_type_song: "şarkı",
    profile_delete_type_edit: "düzenleme",
    profile_confirm_delete: "Bu {type} silinsin mi? Bu işlem geri alınamaz.",
    profile_not_authorized: "Yetkin yok veya bu içerik sana ait değil.",
    action_deleting: "Siliniyor…",
    profile_delete_permission_denied: "Yetkin yok. Sadece bekleyen veya reddedilen düzenlemelerini silebilirsin.",
    profile_firestore_unavailable: "Firestore ulaşılamıyor. Lütfen tekrar deneyin.",
    profile_subtitle_default: "Hesap bilgileri",
    profile_photo_label: "Profil fotoğrafı URL",
    profile_fav_songs: "Favori Şarkılar",
    profile_fav_artists: "Favori Sanatçılar",
    profile_my_songs: "Şarkılarım",
    profile_my_edits: "Düzenlemelerim",
    label_edit: "düzenleme",
    profile_auth_unavailable: "Giriş sistemi bulunamadı.",
    profile_no_submissions_new: "Henüz şarkı eklemedin.",
    profile_no_submissions_edit: "Henüz düzenleme yok.",
    confirm_sign_out: "Çıkış yapmak istiyor musun?",
    status_sign_out_failed: "Çıkış başarısız.",
    status_requires_login_profile: "Giriş yapmalısın.",
    profile_photo_updated: "Fotoğraf güncellendi.",
    profile_photo_update_failed: "Güncellenemedi.",
    profile_name_requires_login: "Giriş yapmalısın",
    profile_status_logged_out: "Giriş yok",
    profile_subtitle_logged_out: "Profil için giriş yap.",
    profile_name_fallback: "Kullanıcı",
    profile_subtitle_logged_in: "Hesabın ve içeriklerin",
    action_favorite_artist: "Sanatçıyı favorile",
    action_unfavorite_artist: "Favoriden çıkar",
    status_artist_favorited: "Sanatçı favorilere eklendi.",
    status_artist_unfavorited: "Sanatçı favorilerden çıkarıldı.",
    status_artist_favorite_failed: "Sanatçı favorilenemedi.",
    status_artist_load_failed: "Şarkılar yüklenemedi.",
    key_suggestion: "💡 Öneri: {key} tonu",
    label_char_count: "{count} karakter",
    label_chord_count: "{count} akor",
    validation_invalid_chords: "⚠️ {count} geçersiz akor: {list}",
    validation_no_chords: "ℹ️ Akor bulunamadı",
    validation_format_ok: "✓ Format doğru",
    login_title: "Giriş",
    login_subtitle: "Şarkı eklemek için giriş yapmalısın.",
    login_google: "Google ile giriş",
    login_divider_or: "veya",
    login_label_email: "E-posta",
    login_placeholder_email: "ornek@email.com",
    login_label_password: "Şifre",
    login_action_sign_in: "Giriş",
    login_action_sign_up: "Kayıt ol",
    login_action_reset: "Şifreni mi unuttun?",
    login_status_signing_in: "Giriş yapılıyor...",
    login_status_sign_in_success: "Giriş başarılı! Yönlendiriliyor...",
    login_error_missing_fields: "Lütfen e-posta ve şifre gir.",
    login_error_firebase_unready: "Firebase henüz yüklenmedi, lütfen bekle...",
    login_error_sign_in_failed: "Giriş başarısız. Lütfen tekrar dene.",
    login_error_user_not_found: "Bu e-posta kayıtlı değil. Önce kayıt ol.",
    login_error_wrong_password: "Şifre yanlış. Lütfen tekrar dene.",
    login_error_invalid_credential: "E-posta veya şifre yanlış. Kayıtlı değilsen önce kayıt ol.",
    login_error_invalid_email: "E-posta geçersiz. Lütfen geçerli bir e-posta gir.",
    login_error_too_many_requests: "Çok fazla deneme. Biraz sonra tekrar dene.",
    login_error_network: "İnternet bağlantısı yok. Lütfen kontrol et.",
    login_error_user_disabled: "Bu hesap devre dışı bırakıldı. Lütfen yöneticiyle iletişime geç.",
    login_error_operation_not_allowed: "Bu giriş yöntemi kapalı. Lütfen yöneticiyle iletişime geç.",
    login_error_generic: "Bir hata oluştu.",
    login_error_password_length: "Şifre en az 6 karakter olmalı.",
    login_status_signing_up: "Kayıt yapılıyor...",
    login_status_sign_up_success: "Kayıt başarılı! Yönlendiriliyor...",
    login_error_sign_up_failed: "Kayıt başarısız. Lütfen tekrar dene.",
    login_error_email_in_use: "Bu e-posta zaten kayıtlı. Bu sana aitse giriş yap.",
    login_error_weak_password: "Şifre çok zayıf. En az 6 karakter olmalı.",
    login_status_google_signing_in: "Google ile giriş yapılıyor...",
    login_status_google_success: "Giriş başarılı! Yönlendiriliyor...",
    login_error_google_failed: "Google ile giriş başarısız. Lütfen tekrar dene.",
    login_error_popup_closed: "Giriş penceresi kapatıldı.",
    login_error_popup_blocked: "Popup engellendi. Lütfen izin ver.",
    login_error_unauthorized_domain: "Bu domain yetkili değil. Firebase ayarlarını kontrol edin.",
    login_status_reset_sending: "E-posta gönderiliyor...",
    login_status_reset_sent: "E-posta gönderildi! Gelen kutunu kontrol et.",
    login_error_reset_missing_email: "Lütfen e-posta yaz.",
    login_error_reset_failed: "E-posta gönderilemedi. Lütfen tekrar dene.",
    login_error_reset_user_not_found: "Bu e-posta kayıtlı değil.",
    login_error_reset_invalid_email: "E-posta geçersiz.",
    login_error_reset_invalid_credential: "E-posta geçersiz. Lütfen kontrol et.",
    login_error_firebase_load_failed: "Firebase yüklenemedi. Lütfen sayfayı yenile."
  }
};

const DEFAULT_LANG = "ku";
const LANG_PATH_PREFIX = "/tr";

function getLangFromPath(pathname){
  if(!pathname) return "";
  if(pathname === LANG_PATH_PREFIX || pathname.startsWith(`${LANG_PATH_PREFIX}/`)) return "tr";
  return "";
}

function stripLangPrefix(pathname){
  if(!pathname) return "/";
  if(pathname === LANG_PATH_PREFIX) return "/";
  if(pathname.startsWith(`${LANG_PATH_PREFIX}/`)){
    const stripped = pathname.slice(LANG_PATH_PREFIX.length);
    return stripped ? stripped : "/";
  }
  return pathname;
}

function applyLangPrefix(pathname, lang){
  const normalized = stripLangPrefix(pathname || "/");
  if(lang === "tr"){
    if(normalized === "/") return `${LANG_PATH_PREFIX}/`;
    return `${LANG_PATH_PREFIX}${normalized}`;
  }
  return normalized;
}

function isLocalEnv(){
  if(typeof window === "undefined") return false;
  if(window.location.protocol === "file:") return true;
  const host = window.location.hostname;
  return ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(host);
}

let pathLang = "";
let urlLang = "";
try{
  pathLang = getLangFromPath(window.location.pathname || "");
  const params = new URLSearchParams(window.location.search);
  urlLang = (params.get("lang") || "").toLowerCase();
  if(urlLang !== "tr" && urlLang !== "ku") urlLang = "";
}catch(_e){
  pathLang = "";
  urlLang = "";
}
let currentLang = (pathLang || urlLang || localStorage.getItem("lang") || DEFAULT_LANG).toLowerCase();
if(!I18N[currentLang]) currentLang = DEFAULT_LANG;
if(pathLang || urlLang){
  try{
    localStorage.setItem("lang", currentLang);
  }catch(_e){}
}

function t(key, vars = {}){
  const table = I18N[currentLang] || I18N[DEFAULT_LANG] || {};
  const fallback = (I18N[DEFAULT_LANG] || {})[key] || key;
  let out = table[key] || fallback;
  Object.keys(vars || {}).forEach((k) => {
    out = out.replaceAll(`{${k}}`, vars[k]);
  });
  return out;
}

function applyTranslations(root = document){
  if(!root) return;
  root.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if(key) el.textContent = t(key);
  });
  root.querySelectorAll("[data-i18n-html]").forEach(el => {
    const key = el.getAttribute("data-i18n-html");
    if(key) el.innerHTML = t(key);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.getAttribute("data-i18n-placeholder");
    if(key) el.setAttribute("placeholder", t(key));
  });
  root.querySelectorAll("[data-i18n-title]").forEach(el => {
    const key = el.getAttribute("data-i18n-title");
    if(key) el.setAttribute("title", t(key));
  });
  root.querySelectorAll("[data-i18n-aria-label]").forEach(el => {
    const key = el.getAttribute("data-i18n-aria-label");
    if(key) el.setAttribute("aria-label", t(key));
  });
  root.querySelectorAll("[data-i18n-tooltip]").forEach(el => {
    const key = el.getAttribute("data-i18n-tooltip");
    if(key) el.setAttribute("data-tooltip", t(key));
  });
}

function updateLangToggle(){
  document.querySelectorAll(".langBtn[data-lang]").forEach(btn => {
    const lang = btn.getAttribute("data-lang");
    btn.classList.toggle("is-active", lang === currentLang);
    btn.setAttribute("aria-pressed", lang === currentLang ? "true" : "false");
  });
}

function syncLangParam(){
  try{
    const url = new URL(window.location.href);
    if(isLocalEnv()){
      if(currentLang === "tr"){
        url.searchParams.set("lang", "tr");
      }else{
        url.searchParams.delete("lang");
      }
    }else{
      url.searchParams.delete("lang");
      url.pathname = applyLangPrefix(url.pathname, currentLang);
    }
    const next = url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : "") + url.hash;
    const current = window.location.pathname + window.location.search + window.location.hash;
    if(next !== current){
      window.history.replaceState(null, "", next);
    }
  }catch(_e){}
}

function appendLangParam(url){
  if(!url || url === "#" || url.startsWith("#")) return url;
  if(/^(mailto:|tel:|javascript:)/i.test(url)) return url;
  try{
    const parsed = new URL(url, window.location.origin);
    if(parsed.origin !== window.location.origin) return url;
    if(isLocalEnv()){
      if(currentLang === "tr"){
        parsed.searchParams.set("lang", "tr");
      }else{
        parsed.searchParams.delete("lang");
      }
    }else{
      parsed.searchParams.delete("lang");
      parsed.pathname = applyLangPrefix(parsed.pathname, currentLang);
    }
    const search = parsed.searchParams.toString();
    return parsed.pathname + (search ? `?${search}` : "") + (parsed.hash || "");
  }catch(_e){
    return url;
  }
}

function applyLangToLinks(root = document){
  if(!root) return;
  const links = root.querySelectorAll("a[href]");
  links.forEach((link) => {
    const href = link.getAttribute("href");
    const next = appendLangParam(href || "");
    if(next && href !== next){
      link.setAttribute("href", next);
    }
  });
}

function bindLangLink(selector, target){
  const links = document.querySelectorAll(selector);
  links.forEach((link) => {
    const next = appendLangParam(target);
    if(next) link.setAttribute("href", next);
    if(link.dataset.langBound) return;
    link.addEventListener("click", (e) => {
      const resolved = appendLangParam(target);
      if(resolved){
        e.preventDefault();
        window.location.href = resolved;
      }
    });
    link.dataset.langBound = "true";
  });
}

function updateLangLinks(){
  bindLangLink('a[data-i18n="nav_all"]', "/all.html");
  bindLangLink('a[data-i18n="home_view_all"]', "/all.html");
}

function setLanguage(lang){
  if(!I18N[lang]) return;
  currentLang = lang;
  localStorage.setItem("lang", lang);
  document.documentElement.setAttribute("lang", lang === "tr" ? "tr" : "ku");
  applyTranslations();
  updateLangToggle();
  syncLangParam();
  applyLangToLinks();
  updateLangLinks();
  if(typeof window.refreshSeo === "function"){
    window.refreshSeo();
  }
}

function initLanguageToggle(){
  document.querySelectorAll(".langBtn[data-lang]").forEach(btn => {
    btn.addEventListener("click", () => {
      setLanguage(btn.getAttribute("data-lang"));
    });
  });
  updateLangToggle();
}

function initI18n(){
  document.documentElement.setAttribute("lang", currentLang === "tr" ? "tr" : "ku");
  applyTranslations();
  initLanguageToggle();
  syncLangParam();
  applyLangToLinks();
  updateLangLinks();
  document.documentElement.classList.remove("i18n-pending");
}

if(document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", initI18n);
} else {
  initI18n();
}

window.t = t;
window.setLanguage = setLanguage;
window.getLanguage = () => currentLang;

const SEO_DOMAIN = "https://repertuarakurdi.com";
const SEO_DEFAULT_IMAGE = `${SEO_DOMAIN}/assets/og/og-image.png`;

function normalizeSeoPath(path){
  if(!path) return "/";
  let out = path.startsWith("/") ? path : `/${path}`;
  if(out === "/index.html") return "/";
  if(out === "/tr/index.html") return "/tr/";
  if(out === "/tr") return "/tr/";
  return out;
}

function toAbsoluteUrl(url){
  if(!url) return "";
  if(/^https?:\/\//i.test(url)) return url;
  return `${SEO_DOMAIN}${normalizeSeoPath(url)}`;
}

function buildSeoUrlForLang(lang, baseUrl){
  let parsed;
  try{
    parsed = baseUrl ? new URL(baseUrl, SEO_DOMAIN) : new URL(window.location.href);
  }catch(_e){
    const fallbackPath = normalizeSeoPath(window.location.pathname || "/");
    return `${SEO_DOMAIN}${fallbackPath}`;
  }
  parsed.protocol = "https:";
  parsed.host = new URL(SEO_DOMAIN).host;
  parsed.searchParams.delete("lang");
  parsed.pathname = applyLangPrefix(parsed.pathname, lang);
  const path = normalizeSeoPath(parsed.pathname);
  const search = parsed.searchParams.toString();
  return `${SEO_DOMAIN}${path}${search ? `?${search}` : ""}`;
}

function ensureMeta(attr, key){
  const selector = `meta[${attr}="${key}"]`;
  let tag = document.head.querySelector(selector);
  if(!tag){
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  return tag;
}

function setMeta(name, content){
  if(!content) return;
  ensureMeta("name", name).setAttribute("content", content);
}

function setMetaProperty(property, content){
  if(!content) return;
  ensureMeta("property", property).setAttribute("content", content);
}

function ensureLink(rel, attrs = {}){
  let selector = `link[rel="${rel}"]`;
  if(attrs.hreflang) selector += `[hreflang="${attrs.hreflang}"]`;
  let link = document.head.querySelector(selector);
  if(!link){
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    if(attrs.hreflang) link.setAttribute("hreflang", attrs.hreflang);
    document.head.appendChild(link);
  }
  if(attrs.href) link.setAttribute("href", attrs.href);
  return link;
}

function setJsonLd(data, id = "seo-jsonld"){
  if(!data) return;
  let script = document.getElementById(id);
  if(!script){
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

function setSeoData(options = {}){
  const title = options.title || document.title || t("seo_site_name");
  const description = options.description || "";
  const canonical = options.canonical ? toAbsoluteUrl(options.canonical) : buildSeoUrlForLang(currentLang);
  const image = options.image || SEO_DEFAULT_IMAGE;
  const ogType = options.ogType || "website";
  const robots = options.robots || "index, follow";
  const locale = currentLang === "tr" ? "tr_TR" : "ku";

  if(title) document.title = title;
  if(description) setMeta("description", description);
  setMeta("robots", robots);
  setMetaProperty("og:site_name", t("seo_site_name"));
  if(title){
    setMetaProperty("og:title", title);
    setMeta("twitter:title", title);
  }
  if(description){
    setMetaProperty("og:description", description);
    setMeta("twitter:description", description);
  }
  setMetaProperty("og:type", ogType);
  if(canonical) setMetaProperty("og:url", canonical);
  if(image){
    setMetaProperty("og:image", image);
    setMetaProperty("og:image:secure_url", image);
    setMetaProperty("og:image:type", "image/png");
    setMetaProperty("og:image:width", "1200");
    setMetaProperty("og:image:height", "630");
    setMeta("twitter:image", image);
    if(title) setMeta("twitter:image:alt", title);
  }
  setMetaProperty("og:locale", locale);
  setMeta("twitter:card", "summary_large_image");

  if(canonical){
    ensureLink("canonical", { href: canonical });
    const kuUrl = buildSeoUrlForLang("ku", canonical);
    const trUrl = buildSeoUrlForLang("tr", canonical);
    ensureLink("alternate", { hreflang: "ku", href: kuUrl });
    ensureLink("alternate", { hreflang: "tr", href: trUrl });
    ensureLink("alternate", { hreflang: "x-default", href: kuUrl });
  }

  if(options.jsonLd){
    setJsonLd(options.jsonLd, options.jsonLdId || "seo-jsonld");
  }
}

function applySeoBase(){
  const rawPath = window.location.pathname || "/";
  const path = stripLangPrefix(rawPath);
  const isHome = path === "/" || path.endsWith("/index.html");
  const isAll = path.endsWith("/all.html");
  const isArtist = path.endsWith("/artist.html");
  const isSong = path.endsWith("/song.html") || path.startsWith("/song/");
  const isLogin = path.endsWith("/login.html");
  const isAdmin = path.endsWith("/admin.html");
  const isProfile = path.endsWith("/profile.html");

  if(isLogin || isAdmin || isProfile){
    setSeoData({ title: document.title, description: "", robots: "noindex, nofollow" });
    return;
  }

  if(isHome){
    setSeoData({
      title: t("seo_home_title"),
      description: t("seo_home_desc"),
      ogType: "website"
    });
    const websiteLd = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: t("seo_site_name"),
      url: buildSeoUrlForLang(currentLang)
    };
    setJsonLd(websiteLd, "seo-jsonld");
    return;
  }

  if(isAll){
    setSeoData({
      title: t("seo_all_title"),
      description: t("seo_all_desc"),
      ogType: "website"
    });
    return;
  }

  if(isArtist){
    setSeoData({
      title: t("seo_artist_title", { artist: t("label_artist") }),
      description: t("seo_artist_desc", { artist: t("label_artist") }),
      ogType: "profile"
    });
    return;
  }

  if(isSong){
    setSeoData({
      title: t("seo_song_title", { song: t("label_song"), artist: t("label_artist") }),
      description: t("seo_song_desc", { song: t("label_song"), artist: t("label_artist") }),
      ogType: "music.song"
    });
  }
}

window.setSeoData = setSeoData;
window.buildSeoUrlForLang = buildSeoUrlForLang;
window.toAbsoluteUrl = toAbsoluteUrl;
window.refreshSeo = () => {
  applySeoBase();
  if(typeof window.__applySeoOverrides === "function"){
    window.__applySeoOverrides();
  }
};
window.refreshSeo();

// Fail-safe: overlay açık kalmışsa kapalı başlat
document.body?.classList.remove("auth-open");

(function ensurePageOverlay(){
  if(!document.body || document.querySelector(".pageOverlay")) return;
  const overlay = document.createElement("div");
  overlay.className = "pageOverlay";
  overlay.setAttribute("aria-hidden", "true");
  document.body.prepend(overlay);
})();

const norm = (s) => (s || "")
  .toString()
  .toLowerCase()
  .trim()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/ı/g, "i")
  .replace(/ğ/g, "g")
  .replace(/ü/g, "u")
  .replace(/ş/g, "s")
  .replace(/ö/g, "o")
  .replace(/ç/g, "c");

const ARTIST_PHOTOS_URL = "/assets/artist-photos/artist-photos.json?v=3";
const ARTIST_PHOTOS_CACHE_KEY = "artistPhotosCache.v3";
let __artistPhotosPromise = null;
let __artistPhotoMap = null;

function buildArtistPhotoMap(list){
  const map = {};
  (Array.isArray(list) ? list : []).forEach((item) => {
    if(!item || !item.artist || !item.photo) return;
    map[norm(item.artist)] = item.photo;
  });
  return map;
}

function readArtistPhotosCache(){
  try{
    const raw = localStorage.getItem(ARTIST_PHOTOS_CACHE_KEY);
    if(!raw) return null;
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : null;
  }catch(_e){
    return null;
  }
}

function writeArtistPhotosCache(list){
  try{
    if(!Array.isArray(list)) return;
    localStorage.setItem(ARTIST_PHOTOS_CACHE_KEY, JSON.stringify(list));
  }catch(_e){}
}

function getArtistPhotosCache(){
  return readArtistPhotosCache() || [];
}

async function loadArtistPhotos(){
  if(__artistPhotosPromise) return __artistPhotosPromise;
  __artistPhotosPromise = fetch(ARTIST_PHOTOS_URL)
    .then((res) => res.ok ? res.json() : [])
    .then((list) => {
      const safeList = Array.isArray(list) ? list : [];
      __artistPhotoMap = buildArtistPhotoMap(safeList);
      writeArtistPhotosCache(safeList);
      return safeList;
    })
    .catch(() => {
      const cached = readArtistPhotosCache();
      if(cached && cached.length){
        __artistPhotoMap = buildArtistPhotoMap(cached);
        return cached;
      }
      __artistPhotoMap = {};
      return [];
    });
  return __artistPhotosPromise;
}

async function getArtistPhoto(name){
  if(!name) return "";
  const map = __artistPhotoMap || (await loadArtistPhotos(), __artistPhotoMap);
  return map?.[norm(name)] || "";
}

const LOCALE = "tr-TR";
function formatSongTitle(title){
  const text = (title || "").toString().trim();
  return text ? text.toLocaleUpperCase(LOCALE) : "";
}
function formatArtistName(name){
  const text = (name || "").toString().trim();
  if(!text) return "";
  const lower = text.toLocaleLowerCase(LOCALE);
  return lower.replace(/(^|[\s'’\-])(\p{L})/gu, (match, sep, ch) => {
    return `${sep}${ch.toLocaleUpperCase(LOCALE)}`;
  });
}
function formatArtistList(value){
  const arr = Array.isArray(value) ? value : (value ? [value] : []);
  return arr.map(v => formatArtistName(v)).filter(Boolean);
}
function formatArtistInputValue(value){
  return formatArtistList(value).join(", ");
}
function normalizeArtistInput(raw){
  const parts = (raw || "")
    .split(/[,;]/)
    .map(s => formatArtistName(s))
    .filter(Boolean);
  if(!parts.length) return "";
  return parts.length === 1 ? parts[0] : parts;
}

function artistArr(a){
  if(Array.isArray(a)) return a.filter(Boolean).map(String);
  if(a == null) return [];
  return [String(a)].filter(Boolean);
}

function escapeHtml(str){
  return (str ?? "").toString()
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

const STATIC_BG = true;
const ADMIN_EMAILS = (window.ADMIN_EMAILS || ["ucaraahmet@gmail.com"])
  .map(v => (v || "").toString().trim().toLowerCase())
  .filter(Boolean);

function pickRandom(arr, n){
  const copy = [...(arr || [])];
  // Fisher–Yates shuffle (in-place)
  for(let i = copy.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.max(0, n|0));
}

function uniqueArtistsFromSongs(songs){
  const map = new Map();
  (songs || []).forEach((song) => {
    const list = formatArtistList(song?.artist);
    list.forEach((name) => {
      const key = norm(name);
      if(name && !map.has(key)) map.set(key, name);
    });
  });
  return Array.from(map.values()).sort((a,b) => a.localeCompare(b, LOCALE));
}

function updateGlobalStats(songs){
  const elSongs = document.getElementById("statSongs");
  const elArtists = document.getElementById("statArtists");
  if(!elSongs && !elArtists) return;
  const list = songs || [];
  const songCount = list.length;
  const artistCount = uniqueArtistsFromSongs(list).length;
  if(elSongs) elSongs.textContent = songCount.toString();
  if(elArtists) elArtists.textContent = artistCount.toString();
}

function levenshtein(a, b){
  if(a === b) return 0;
  const m = a.length;
  const n = b.length;
  if(!m) return n;
  if(!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for(let i = 0; i <= m; i++) dp[i][0] = i;
  for(let j = 0; j <= n; j++) dp[0][j] = j;
  for(let i = 1; i <= m; i++){
    for(let j = 1; j <= n; j++){
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

// Fonksiyona lêgerînê ya pêşketî - fuzzy search
function fuzzySearch(query, songs){
  if(!query || query.length < 1) return [];
  
  const q = norm(query);
  const qLength = q.length;
  const results = [];
  
  for(const song of songs){
    const songTitle = norm(song.song || "");
    const artistNames = artistArr(song.artist).map(a => norm(a));
    const searchText = `${songTitle} ${artistNames.join(" ")}`;
    
    let score = 0;
    let matchType = "none";
    
    // 1. Lihevhatina tam (pêşîya herî bilind)
    if(searchText === q){
      score = 1000;
      matchType = "exact";
    }
    // 2. Lihevhatina destpêkê
    else if(searchText.startsWith(q)){
      score = 800 - qLength;
      matchType = "starts";
    }
    // 3. Lihevhatina destpêka peyvê
    else if(searchText.includes(` ${q}`) || searchText.includes(q)){
      const index = searchText.indexOf(q);
      const wordStart = index === 0 || searchText[index - 1] === " ";
      if(wordStart){
        score = 600 - index;
        matchType = "word";
      }else{
        score = 400 - index;
        matchType = "contains";
      }
    }
    // 4. Lihevhatina fuzzy - dûrahiya Levenshtein
    else{
      const words = searchText.split(/\s+/);
      let minDistance = Infinity;
      let bestMatch = "";
      
      // Her peyvê kontrol bike
      for(const word of words){
        if(word.length < 2) continue;
        const distance = levenshtein(q, word);
        if(distance < minDistance){
          minDistance = distance;
          bestMatch = word;
        }
      }
      
      // Hemû nivîsê kontrol bike
      const fullDistance = levenshtein(q, searchText);
      if(fullDistance < minDistance){
        minDistance = fullDistance;
      }
      
      // Puan: dûrahî çiqas piçûktir ew qas baştir
      // Heya 3 tîpela cudahiyê qebûl bike
      if(minDistance <= 3 && qLength >= 2){
        const matchLength = bestMatch ? bestMatch.length : searchText.length;
        score = 300 - (minDistance * 50) - Math.abs(qLength - matchLength);
        matchType = "fuzzy";
      }
      // 5. Ger piraniya tîpelan lihevhatin (lihevhatina qismî)
      else if(qLength >= 3){
        const qChars = q.split("");
        const matchedChars = qChars.filter(c => searchText.includes(c)).length;
        const matchRatio = matchedChars / qLength;
        if(matchRatio >= 0.6){
          score = 100 + (matchRatio * 100);
          matchType = "partial";
        }
      }
    }
    
    if(score > 0){
      results.push({
        song,
        score,
        matchType
      });
    }
  }
  
  // Li gorî puanê rêz bike û encamên herî baş vegerîne
  return results
    .sort((a, b) => {
      if(b.score !== a.score) return b.score - a.score;
      // Ger puan wekhev e alfabetîk rêz bike
      return norm(a.song.song || "").localeCompare(norm(b.song.song || ""), "tr");
    })
    .slice(0, 50)
    .map(r => r.song);
}

window.fuzzySearch = fuzzySearch;
window.pickRandom = pickRandom;

function suggestArtists(query, artists){
  const q = norm(query);
  if(!q || q.length < 2) return [];
  const scored = [];
  for(const name of artists){
    const n = norm(name);
    if(!n || n === q) continue;
    if(n.includes(q)){
      scored.push({ name, score: 0 });
      continue;
    }
    const dist = levenshtein(q, n);
    if(dist <= 2){
      scored.push({ name, score: 1 + dist });
      continue;
    }
    const tokens = n.split(/\s+/);
    let tokenScore = Infinity;
    tokens.forEach((t) => { tokenScore = Math.min(tokenScore, levenshtein(q, t)); });
    if(tokenScore <= 1){
      scored.push({ name, score: 3 + tokenScore });
    }
  }
  return scored
    .sort((a,b) => a.score - b.score || a.name.length - b.name.length)
    .slice(0, 6)
    .map(s => s.name);
}

function initArtistSuggest(inputEl, listEl){
  if(!inputEl || !listEl) return;
  let pool = [];

  const fill = (names) => {
    if(!names.length){
      listEl.innerHTML = "";
      listEl.classList.remove("is-open");
      return;
    }
    listEl.innerHTML = "";
    names.forEach((name) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "suggestItem";
      btn.dataset.artist = name;
      btn.textContent = name;
      listEl.appendChild(btn);
    });
    listEl.classList.add("is-open");
  };

  const update = () => {
    const raw = (inputEl.value || "").toString();
    const parts = raw.split(/[,;]/);
    const query = (parts[parts.length - 1] || "").trim();
    const names = suggestArtists(query, pool);
    fill(names);
  };

  const applySuggestion = (name) => {
    const raw = (inputEl.value || "").toString();
    const parts = raw.split(/[,;]/).map(s => s.trim()).filter(Boolean);
    if(parts.length <= 1){
      inputEl.value = name;
      return;
    }
    parts[parts.length - 1] = name;
    inputEl.value = parts.join(", ");
  };

  loadSongs().then((songs) => {
    pool = uniqueArtistsFromSongs(songs);
  });

  inputEl.addEventListener("focus", update);
  inputEl.addEventListener("input", update);
  inputEl.addEventListener("blur", () => {
    const normalized = normalizeArtistInput(inputEl.value);
    if(normalized){
      inputEl.value = formatArtistInputValue(normalized);
    }
    setTimeout(() => fill([]), 120);
  });

  listEl.addEventListener("click", (ev) => {
    const btn = ev.target?.closest?.("button[data-artist]");
    if(!btn) return;
    applySuggestion(btn.dataset.artist || "");
    inputEl.focus();
    fill([]);
  });
}

function songId(song){
  if(song?.id) return String(song.id);
  const pdf = (song?.pdf || "").toString().trim();
  const page = song?.page_original;
  if(pdf && page != null && page !== "") return `${pdf}|${page}`;
  return "";
}

function slugifySongTitle(title){
  return (title || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function songIdToSlug(id){
  return (id || "")
    .toString()
    .toLowerCase()
    .replace(/\.pdf/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildSongSlug(song){
  if(!song) return "song";
  const title = song?.song || song?.title || "";
  const artist = song?.artist || "";
  const base = slugifySongTitle(title);
  const artistSlug = slugifySongTitle(artist);
  const idSlug = songIdToSlug(songId(song));
  const parts = [base, artistSlug, idSlug].filter(Boolean);
  return parts.join("-") || "song";
}

function buildSongUrl(song){
  const id = typeof song === "string" ? song : songId(song);
  const slug = typeof song === "string"
    ? (songIdToSlug(id) ? `song-${songIdToSlug(id)}` : "song")
    : buildSongSlug(song);
  const isLocal = typeof window !== "undefined" && (
    window.location.protocol === "file:" ||
    ["localhost", "127.0.0.1", "0.0.0.0", "::1"].includes(window.location.hostname)
  );
  let url = "";
  if(isLocal){
    url = id ? `/song.html?id=${encodeURIComponent(id)}` : "/song.html";
  }else{
    url = `/song/${slug || "song"}`;
    if(typeof song === "string" && id){
      url += `?id=${encodeURIComponent(id)}`;
    }
  }
  return appendLangParam(url);
}

function toMs(ts){
  if(!ts) return 0;
  if(typeof ts.toMillis === "function") return ts.toMillis();
  if(typeof ts.seconds === "number") return ts.seconds * 1000;
  return 0;
}

function mergeSongs(baseSongs, submissions, options = {}){
  const includePending = options.includePending !== false;
  const currentUserId = options.currentUserId || null;
  const base = (baseSongs || []).map(s => {
    const id = songId(s);
    return {
      ...s,
      id,
      sourceId: id,
      pending: false,
      approved: false,
      submissionId: ""
    };
  });

  const editsBySource = new Map();
  const newItems = [];

  (submissions || []).forEach(sub => {
    const status = (sub?.status || "pending").toString();
    if(status === "rejected") return;
    // Pending değişiklikleri göster: admin ise hepsini, normal kullanıcı ise sadece kendi yaptıklarını
    if(status === "pending" && !includePending){
      // Eğer kullanıcı kendi yaptığı değişikliği görüyorsa, onu da dahil et
      if(currentUserId && sub.createdBy === currentUserId){
        log("✅ Kullanıcının kendi pending değişikliği dahil ediliyor:", sub._id, sub.sourceId);
        // Kullanıcının kendi değişikliği, dahil et - devam et
      } else {
        log("⏭️ Başkasının pending değişikliği atlanıyor:", sub._id);
        return; // Başkasının pending değişikliği, atla
      }
    }
    const type = (sub?.type || "").toString().toLowerCase();
    const sourceId = (sub?.sourceId || "").toString().trim();

    if(type === "new" || !sourceId){
      const id = `new:${sub._id}`;
      newItems.push({
        ...sub,
        id,
        sourceId: "",
        pending: status === "pending",
        approved: status === "approved",
        submissionId: sub._id
      });
      return;
    }

    const prev = editsBySource.get(sourceId);
    const subMs = toMs(sub.updatedAt || sub.createdAt);
    const prevMs = prev ? toMs(prev.updatedAt || prev.createdAt) : -1;
    if(!prev || subMs >= prevMs){
      editsBySource.set(sourceId, sub);
      log("📌 Edit kaydedildi:", sourceId, "status:", sub.status, "createdBy:", sub.createdBy, "type:", sub.type);
    }
  });

  log("🗺️ editsBySource map size:", editsBySource.size, "entries:", Array.from(editsBySource.entries()).map(([k, v]) => ({ sourceId: k, status: v.status, createdBy: v.createdBy })));

  const merged = base.map(song => {
    const sub = editsBySource.get(song.sourceId);
    if(!sub) return song;
    log("🔄 Şarkı merge ediliyor:", song.sourceId, "submission:", sub._id, "status:", sub.status);

    const overlay = {};
    ["song","artist","key","ritim","text"].forEach(key => {
      const val = sub[key];
      if(val != null && val !== "") overlay[key] = val;
    });
    return {
      ...song,
      ...overlay,
      pending: sub.status === "pending",
      approved: sub.status === "approved",
      submissionId: sub._id
    };
  });

  return merged.concat(newItems);
}

// Global Firebase initialization promise - tüm çağrılar aynı promise'i bekler
let __firebaseInitPromise = null;
function waitForFirebaseInit() {
  if (__firebaseInitPromise) {
    return __firebaseInitPromise;
  }
  
  __firebaseInitPromise = (async () => {
    // Firebase SDK yüklenene kadar bekle - Mobil veri için daha uzun bekleme
    let retryCount = 0;
    const maxRetries = 40; // 20 saniye (500ms * 40) - mobil veri için artırıldı
    while (retryCount < maxRetries && (!window.firebase || !window.fbAuth || !window.fbDb)) {
      await new Promise(resolve => setTimeout(resolve, 500));
      retryCount++;
    }
    
    if (!window.firebase) {
      warn("⚠️ Firebase SDK not loaded after waiting");
      return false;
    }
    
    // Auth state hazır olana kadar bekle (sadece ilk kez)
    if (window.fbAuth && !window.__authStateReady) {
      await new Promise((resolve) => {
        const timeout = setTimeout(() => {
          window.__authStateReady = true;
          resolve();
        }, 5000); // Max 5 saniye bekle - mobil veri için artırıldı
        const unsubscribe = window.fbAuth.onAuthStateChanged((user) => {
          clearTimeout(timeout);
          window.__authStateReady = true;
          unsubscribe();
          resolve();
        });
      });
    }
    
    // Firestore'un tamamen hazır olmasını bekle
    if (window.fbDb) {
      try {
        // Firestore'un hazır olduğunu test et - basit bir işlem yap
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            resolve(); // Timeout'ta devam et
          }, 5000); // 5 saniye - mobil veri için artırıldı
          
          // Firestore'un hazır olduğunu kontrol et
          if (window.fbDb._delegate && window.fbDb._delegate._databaseId) {
            clearTimeout(timeout);
            resolve();
          } else {
            // Biraz bekle ve tekrar dene
            setTimeout(() => {
              clearTimeout(timeout);
              resolve();
            }, 500);
          }
        });
      } catch (err) {
        warn("⚠️ Firestore readiness check failed:", err);
      }
    }
    
    return true;
  })();
  
  return __firebaseInitPromise;
}

// Global loadSongs lock - eşzamanlı çağrıları engelle
let __loadSongsInProgress = { fast: null, full: null };

async function loadSongs(options = {}){
  const waitForFirebase = options.waitForFirebase !== false;
  const mode = waitForFirebase ? "full" : "fast";
  // Eğer zaten bir loadSongs çağrısı devam ediyorsa, onu bekle
  if (__loadSongsInProgress[mode]) {
    return __loadSongsInProgress[mode];
  }
  
  // Yeni bir promise oluştur
  __loadSongsInProgress[mode] = (async () => {
    try {
      // Firebase'in hazır olmasını bekle (tüm çağrılar aynı promise'i bekler)
      const firebaseReady = waitForFirebase ? await waitForFirebaseInit() : false;
      if (!waitForFirebase && !__firebaseInitPromise) {
        // Firebase'i arka planda başlat ama bekleme
        waitForFirebaseInit().catch(() => {});
      }
      
      const currentUser = window.fbAuth?.currentUser;
      const includePending = typeof options.includePending === "boolean"
        ? options.includePending
        : !!window.isAdminUser?.(currentUser);
      const currentUserId = currentUser?.uid || null;
      
      // Cache key'e currentUserId de ekle
      const cacheKey = `${includePending}_${currentUserId || 'anonymous'}`;
      
      const cacheKeyMatches = window.__songsCache
        && window.__songsCacheKey === cacheKey
        && window.__songsCache.length > 0;
      const cacheIsMerged = window.__songsCacheMerged === true;
      
      // Eğer cache varsa ve key eşleşiyorsa, cache'i kullan
      if (cacheKeyMatches && (waitForFirebase ? cacheIsMerged : true)) {
        window.SONGS = window.__songsCache;
        return window.__songsCache;
      }
      
      // Cache key değişmişse temizle
      if (window.__songsCache && window.__songsCacheKey !== cacheKey) {
        window.__songsCache = null;
        window.__songsCacheKey = null;
        window.__songsCacheMerged = null;
      }

      let base = [];
      let jsonRetryCount = 0;
      const jsonMaxRetries = 5; // 3'ten 5'e çıkarıldı - mobil veri için daha fazla deneme
      
      if (cacheKeyMatches && !cacheIsMerged) {
        base = window.__songsCache;
      }
      
      while(jsonRetryCount < jsonMaxRetries && base.length === 0) {
        try{
          // Mobil veri için daha uzun timeout
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 saniye timeout
          
          const res = await fetch(`/assets/songs.json?v=${Date.now()}`, { 
            cache: "no-store",
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });
          clearTimeout(timeoutId);
          if(res.ok) {
            base = await res.json();
            break;
          } else {
            // Retry without cache-busting
            const retryController = new AbortController();
            const retryTimeoutId = setTimeout(() => retryController.abort(), 30000);
            const retryRes = await fetch("/assets/songs.json", { 
              cache: "no-store",
              signal: retryController.signal
            });
            clearTimeout(retryTimeoutId);
            if(retryRes.ok) {
              base = await retryRes.json();
              break;
            }
          }
        }catch(err){
          jsonRetryCount++;
          if(jsonRetryCount < jsonMaxRetries) {
            // Exponential backoff - her retry'da bekleme süresi artar
            const delay = 2000 * Math.pow(2, jsonRetryCount - 1); // 2s, 4s, 8s, 16s
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      if(base.length === 0) {
        // Son çare: cache'den dene
        if(window.__songsCache && window.__songsCache.length > 0) {
          window.SONGS = window.__songsCache;
          return window.__songsCache;
        }
        return [];
      }

      let subs = [];
      const db = window.fbDb;
      if(db && waitForFirebase && firebaseReady){
        try{
          // Firestore'un hazır olduğundan emin ol - daha uzun bekleme
          if (!db._delegate || !db._delegate._databaseId) {
            // Firestore henüz hazır değil, daha uzun bekle
            let retries = 0;
            const maxRetries = 10;
            while (retries < maxRetries && (!db._delegate || !db._delegate._databaseId)) {
              await new Promise(resolve => setTimeout(resolve, 500));
              retries++;
            }
          }
          
          // Eğer hala hazır değilse, Firestore sorgusunu atla
          if (!db._delegate || !db._delegate._databaseId) {
            warn("⚠️ Firestore not ready, skipping submissions query");
          } else {
            // Firebase timeout - 8 saniye içinde tamamlanmazsa devam et
            const firebasePromise = db
              .collection("song_submissions")
              .where("status", "in", ["pending","approved"])
              .get();
            
            const timeoutPromise = new Promise((resolve) => {
              setTimeout(() => {
                resolve({ docs: [] });
              }, 20000); // 8 saniyeden 20 saniyeye çıkarıldı - mobil veri için
            });
            
            const snap = await Promise.race([firebasePromise, timeoutPromise]);
            subs = snap.docs.map(doc => ({ _id: doc.id, ...doc.data() }));
          }
        }catch(err){
          // Firestore hatası - sessizce devam et, sadece base songs kullan
          // "INTERNAL ASSERTION FAILED" hatasını özel olarak yakala
          if (err.message && err.message.includes("INTERNAL ASSERTION FAILED")) {
            warn("⚠️ Firestore internal error, using base songs only");
          } else {
            warn("⚠️ Firestore query failed, using base songs only:", err.message);
          }
        }
      }

      try {
        if (!waitForFirebase || !firebaseReady) {
          if (window.__songsCacheMerged === true && window.__songsCacheKey === cacheKey) {
            window.SONGS = window.__songsCache;
            return window.__songsCache;
          }
          window.__songsCache = base;
          window.__songsCacheMerged = false;
          window.__songsCacheIncludePending = includePending;
          window.__songsCacheKey = cacheKey;
          window.SONGS = window.__songsCache;
          
          updateGlobalStats(window.__songsCache);
          return window.__songsCache;
        }
        
        window.__songsCache = mergeSongs(base, subs, { includePending, currentUserId });
        window.__songsCacheMerged = true;
        window.__songsCacheIncludePending = includePending;
        window.__songsCacheKey = cacheKey;
        window.SONGS = window.__songsCache;
        
        updateGlobalStats(window.__songsCache);
        return window.__songsCache;
      } catch(err) {
        error("❌ mergeSongs() error:", err);
        window.__songsCache = base;
        window.__songsCacheMerged = false;
        window.__songsCacheKey = cacheKey;
        window.SONGS = window.__songsCache;
        return window.__songsCache;
      }
    } finally {
      // Lock'u temizle
      __loadSongsInProgress[mode] = null;
    }
  })();
  
  return __loadSongsInProgress[mode];
}

// loadSongs'u window objesine de ata - mobil search overlay için
window.loadSongs = loadSongs;
// waitForFirebaseInit'i de export et - diğer dosyalar kullanabilsin
window.waitForFirebaseInit = waitForFirebaseInit;

function clearSongsCache(){
  window.__songsCache = null;
  window.__songsCacheIncludePending = null;
  window.__songsCacheKey = null;
  window.__songsCacheMerged = null;
  window.SONGS = null;
  // Firebase init promise'i de sıfırla (yeniden başlatmak için)
  __firebaseInitPromise = null;
  // Tüm cache'leri temizle
  if('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        caches.delete(name);
      });
    });
  }
  // Service Worker cache'ini de temizle
  if('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
      });
    });
  }
}

// Favorileme fonksiyonları
let userFavoritesCache = null;
let userFavoritesCacheUid = null;

async function loadUserFavorites(uid){
  if(userFavoritesCache && userFavoritesCacheUid === uid){
    return userFavoritesCache;
  }
  const db = window.fbDb;
  if(!db || !uid) return [];
  
  try{
    const snap = await db.collection("favorites").where("uid", "==", uid).get();
    const favorites = snap.docs.map(doc => doc.data().songId).filter(Boolean);
    userFavoritesCache = favorites;
    userFavoritesCacheUid = uid;
    return favorites;
  }catch(err){
    warn("Favoriler yüklenemedi:", err);
    return [];
  }
}

function clearFavoritesCache(){
  userFavoritesCache = null;
  userFavoritesCacheUid = null;
}

function isFavorite(songId, favorites){
  return favorites && favorites.includes(songId);
}

async function toggleFavoriteSong(song){
  const user = window.fbAuth?.currentUser;
  const db = window.fbDb;
  
  if(!user || !db){
    window.requireAuthAction?.(() => {
      toggleFavoriteSong(song);
    }, t("status_requires_login_favorite"));
    return false;
  }
  
  const sId = window.songId?.(song) || "";
  if(!sId) return false;
  
  const favId = `${user.uid}_${sId}`;
  const favRef = db.collection("favorites").doc(favId);
  
  try{
    const doc = await favRef.get();
    if(doc.exists){
      await favRef.delete();
      clearFavoritesCache();
      return false; // Favoriden çıkarıldı
    }else{
      const stamp = window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || null;
      await favRef.set({
        uid: user.uid,
        songId: sId,
        song: song?.song || "",
        artist: song?.artist || "",
        createdAt: stamp
      });
      clearFavoritesCache();
      return true; // Favorilere eklendi
    }
  }catch(err){
    error("Favori kaydedilemedi:", err);
    return null;
  }
}

window.songId = songId;
window.slugifySongTitle = slugifySongTitle;
window.buildSongUrl = buildSongUrl;
window.buildSongSlug = buildSongSlug;
window.appendLangParam = appendLangParam;
window.applyLangToLinks = applyLangToLinks;
window.loadSongs = loadSongs;
window.clearSongsCache = clearSongsCache;
window.formatSongTitle = formatSongTitle;
window.norm = norm;
window.loadArtistPhotos = loadArtistPhotos;
window.getArtistPhoto = getArtistPhoto;
window.getArtistPhotosCache = getArtistPhotosCache;
window.pickRandom = pickRandom;
window.artistArr = artistArr;
window.escapeHtml = escapeHtml;
window.formatArtistName = formatArtistName;
window.formatArtistList = formatArtistList;
window.formatArtistInputValue = formatArtistInputValue;
window.normalizeArtistInput = normalizeArtistInput;
window.initArtistSuggest = initArtistSuggest;
window.loadUserFavorites = loadUserFavorites;
window.clearFavoritesCache = clearFavoritesCache;
window.isFavorite = isFavorite;
window.toggleFavoriteSong = toggleFavoriteSong;
window.updateGlobalStats = updateGlobalStats;
window.isAdminUser = (user) => {
  const email = (user?.email || "").toString().trim().toLowerCase();
  return !!email && ADMIN_EMAILS.includes(email);
};

(function initGlobalStats(){
  if(document.getElementById("statSongs") || document.getElementById("statArtists")){
    const path = stripLangPrefix(window.location.pathname || "/");
    const isHome = path === "/" || path.endsWith("/index.html");
    const options = isHome ? { waitForFirebase: false } : {};
    loadSongs(options).catch(() => {});
  }
})();

async function ensureProfile(user){
  // Firebase'in hazır olmasını bekle
  if (typeof window.waitForFirebaseInit === "function") {
    await window.waitForFirebaseInit();
  } else {
    // Fallback: Firebase'in hazır olmasını bekle
    let retries = 0;
    const maxRetries = 10;
    while (retries < maxRetries && (!window.fbDb || !window.fbDb._delegate)) {
      await new Promise(resolve => setTimeout(resolve, 300));
      retries++;
    }
  }
  
  const db = window.fbDb;
  if(!db || !user) return;
  
  // Firestore'un hazır olduğundan emin ol
  if (!db._delegate || !db._delegate._databaseId) {
    // Biraz bekle ve tekrar dene
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  try {
    const ref = db.collection("profiles").doc(user.uid);
    const snap = await ref.get().catch(() => null);
    const stamp = window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || null;
    const payload = {
      email: user.email || "",
      displayName: user.displayName || "",
      photoURL: user.photoURL || "",
      lastLoginAt: stamp
    };
    if(!snap || !snap.exists){
      payload.createdAt = stamp;
    }
    await ref.set(payload, { merge: true });
  }catch(err){
    // Sessizce devam et - profil kaydı kritik değil
    warn("Profil kaydı oluşturulamadı:", err.message);
  }
}

function initAddSongPanel(onSaved){
  const auth = window.fbAuth;
  const db = window.fbDb;
  const addToggleWrap = document.getElementById("addSongToggleWrap");
  const addToggle = document.getElementById("addSongToggle");
  const addPanel = document.getElementById("addSongPanel");
  const addClose = document.getElementById("addSongClose");
  const addSave = document.getElementById("addSongSave");
  const addNotice = document.getElementById("addSongNotice");
  const addSongName = document.getElementById("addSongName");
  const addSongArtist = document.getElementById("addSongArtist");
  const addSongKey = document.getElementById("addSongKey");
  const addSongRhythm = document.getElementById("addSongRhythm");
  const addSongText = document.getElementById("addSongText");
  const addArtistSuggest = document.getElementById("addSongArtistSuggest");

  if(!addPanel) return false;

  const adjustTextareaHeight = (el) => {
    if(!el) return;
    el.style.height = "auto";
    el.style.height = (el.scrollHeight) + "px";
  };

  const setNotice = (msg, isError = false) => {
    if(!addNotice) return;
    addNotice.textContent = msg || "";
    addNotice.style.color = isError ? "#ef4444" : "";
  };

  const resetForm = () => {
    if(addSongName) addSongName.value = "";
    if(addSongArtist) addSongArtist.value = "";
    if(addSongKey) addSongKey.value = "";
    if(addSongRhythm) addSongRhythm.value = "";
    if(addSongText) {
      addSongText.value = "";
      adjustTextareaHeight(addSongText);
    }
  };

  const closePanel = () => {
    addPanel?.classList.add("is-hidden");
    resetForm();
  };

  if(addToggleWrap) addToggleWrap.style.display = "flex";
  if(addSongArtist && addArtistSuggest){
    initArtistSuggest(addSongArtist, addArtistSuggest);
  }
  
  // Artist input tooltip yönetimi
  const artistInfoIcon = document.querySelector("#addSongArtist")?.previousElementSibling?.querySelector(".infoIcon");
  if(artistInfoIcon && addSongArtist){
    let tooltipElement = null;
    let tooltipVisible = false;
    let tooltipDismissed = false;
    
    const createTooltip = () => {
      if(tooltipElement) return tooltipElement;
      const tooltip = document.createElement("div");
      tooltip.className = "artist-tooltip";
      tooltip.innerHTML = `
        <button class="tooltip-close" aria-label="Kapat">✕</button>
        <div class="tooltip-content">${artistInfoIcon.getAttribute("data-tooltip")}</div>
      `;
      document.body.appendChild(tooltip);
      tooltipElement = tooltip;
      
      // Kapatma butonuna tıklayınca kapat
      tooltip.querySelector(".tooltip-close").addEventListener("click", (e) => {
        e.stopPropagation();
        hideTooltip({ dismiss: true, focusInput: true });
      });
      
      return tooltip;
    };
    
    const showTooltip = (force = false) => {
      if(tooltipVisible) return;
      if(tooltipDismissed && !force) return;
      tooltipVisible = true;
      const tooltip = createTooltip();
      tooltip.classList.add("tooltip-visible");
      artistInfoIcon.classList.add("tooltip-active");
      if(force) tooltipDismissed = false;
    };
    
    const hideTooltip = ({ dismiss = false, focusInput = false } = {}) => {
      if(!tooltipVisible){
        if(dismiss) tooltipDismissed = true;
        return;
      }
      tooltipVisible = false;
      if(tooltipElement) {
        tooltipElement.classList.remove("tooltip-visible");
      }
      artistInfoIcon.classList.remove("tooltip-active");
      if(dismiss) tooltipDismissed = true;
      if(focusInput){
        setTimeout(() => addSongArtist.focus(), 0);
      }
    };
    
    // Input'a focus olduğunda göster
    addSongArtist.addEventListener("focus", () => showTooltip(false));
    
    // Icon'a tıklayınca toggle
    artistInfoIcon.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if(tooltipVisible) {
        hideTooltip({ dismiss: true });
      } else {
        showTooltip(true);
      }
    });
    
    // Input'tan çıkınca kapat (biraz gecikmeyle)
    addSongArtist.addEventListener("blur", () => {
      setTimeout(() => {
        if(document.activeElement !== addSongArtist && document.activeElement !== tooltipElement?.querySelector(".tooltip-close")) {
          hideTooltip();
        }
      }, 200);
    });
    
    // Panel kapanınca tooltip'i temizle
    const panelObserver = new MutationObserver(() => {
      if(addPanel.classList.contains("is-hidden")) {
        hideTooltip();
        tooltipDismissed = false;
        if(tooltipElement) {
          tooltipElement.remove();
          tooltipElement = null;
        }
      }
    });
    panelObserver.observe(addPanel, { attributes: true, attributeFilter: ["class"] });
  }
  
  // Textarea otomatik yükseklik ayarlaması
  if(addSongText){
    addSongText.addEventListener("input", () => {
      adjustTextareaHeight(addSongText);
    });
    // İlk yüklemede de ayarla
    setTimeout(() => adjustTextareaHeight(addSongText), 0);
  }
  
  // Initialize enhancements (after panel is ready)
  setTimeout(() => {
    if(document.getElementById("chordDictionary")){
      initChordDictionary("chordDictionary", "addSongText");
    }
    initEditPanelEnhancements(
      "add",
      "addSongText",
      "addSongCharCount",
      "addSongChordCount",
      "addSongValidation",
      "addSongPreview",
      "addSongPreviewToggle"
    );
    
    // Mobilde klavye navigasyonu - Enter ile sonraki alana geç
    if(window.innerWidth <= 768){
      const inputs = [addSongName, addSongArtist, addSongKey, addSongRhythm].filter(Boolean);
      inputs.forEach((input, index) => {
        if(input && inputs[index + 1]){
          input.addEventListener("keydown", (e) => {
            if(e.key === "Enter" && !e.shiftKey){
              e.preventDefault();
              inputs[index + 1].focus();
              // Mobilde input görünür olsun
              setTimeout(() => {
                inputs[index + 1].scrollIntoView({ behavior: "smooth", block: "center" });
              }, 100);
            }
          });
        }
      });
      
      // Input'lara focus olduğunda görünür olsun
      [addSongName, addSongArtist, addSongKey, addSongRhythm, addSongText].forEach(input => {
        if(input){
          input.addEventListener("focus", () => {
            setTimeout(() => {
              input.scrollIntoView({ behavior: "smooth", block: "center" });
            }, 300);
          });
        }
      });
    }
  }, 100);
  
  // ESC key to close
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && !addPanel.classList.contains("is-hidden")){
      closePanel();
    }
  });
  
  if(auth){
    auth.onAuthStateChanged((user) => {
      if(!user) closePanel();
      window.updateFilterOptions?.(user);
    });
  }

  const openPanel = () => {
    if(!window.fbAuth?.currentUser){
      window.requireAuthAction?.(() => {
        addPanel.classList.remove("is-hidden");
        // Mobilde panel açıldığında scroll ve focus
        if(window.innerWidth <= 768){
          setTimeout(() => {
            addPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
            if(addSongName){
              setTimeout(() => {
                addSongName.focus();
                addSongName.scrollIntoView({ behavior: "smooth", block: "center" });
              }, 300);
            }
          }, 50);
        } else {
          addPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setTimeout(() => adjustTextareaHeight(addSongText), 100);
      }, t("status_requires_login_add"));
      return;
    }
    addPanel.classList.remove("is-hidden");
    // Mobilde panel açıldığında scroll ve focus
    if(window.innerWidth <= 768){
      setTimeout(() => {
        addPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
        if(addSongName){
          setTimeout(() => {
            addSongName.focus();
            addSongName.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 300);
        }
      }, 50);
    } else {
      addPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setTimeout(() => adjustTextareaHeight(addSongText), 100);
  };

  // openPanel fonksiyonunu global olarak expose et
  window.openAddSongPanel = openPanel;
  
  addToggle?.addEventListener("click", () => {
    if(addPanel.classList.contains("is-hidden")){
      openPanel();
    }else{
      addPanel.classList.add("is-hidden");
    }
  });
  addClose?.addEventListener("click", closePanel);

  addSave?.addEventListener("click", async () => {
    const user = window.fbAuth?.currentUser;
    if(!db || !user){
      window.requireAuthAction?.(() => {
        addPanel.classList.remove("is-hidden");
      }, t("status_requires_login_add"));
      return;
    }
    
    // Validation
    const song = (addSongName?.value || "").trim();
    const rawArtist = (addSongArtist?.value || "").trim();
    const artist = normalizeArtistInput(rawArtist);
    const key = (addSongKey?.value || "").trim();
    const rhythm = (addSongRhythm?.value || "").trim();
    const text = (addSongText?.value || "").toString();
    
    // Remove error classes
    if(addSongName) addSongName.classList.remove("error");
    if(addSongArtist) addSongArtist.classList.remove("error");
    if(addSongKey) addSongKey.classList.remove("error");
    if(addSongRhythm) addSongRhythm.classList.remove("error");
    if(addSongText) addSongText.classList.remove("error");
    
    let hasError = false;
    
    if(!song){
      setNotice(t("status_song_required"), true);
      if(addSongName){
        addSongName.classList.add("error");
        addSongName.focus();
      }
      hasError = true;
    }
    
    if(!rawArtist || !artist){
      if(!hasError){
        setNotice(t("status_artist_required"), true);
        if(addSongArtist){
          addSongArtist.classList.add("error");
          addSongArtist.focus();
        }
        hasError = true;
      }
    }
    
    if(!key){
      if(!hasError){
        setNotice(t("status_key_required"), true);
        if(addSongKey){
          addSongKey.classList.add("error");
          addSongKey.focus();
        }
        hasError = true;
      }
    }
    
    if(!text || !text.trim()){
      if(!hasError){
        setNotice(t("status_text_required"), true);
        if(addSongText){
          addSongText.classList.add("error");
          addSongText.focus();
        }
        hasError = true;
      }
    }
    
    if(hasError) return;

    try{
      const stamp = window.firebase?.firestore?.FieldValue?.serverTimestamp?.() || null;
      await db.collection("song_submissions").add({
        type: "new",
        status: "pending",
        song,
        artist,
        key,
        ritim: rhythm,
        text,
        createdBy: user.uid,
        createdByEmail: user.email || "",
        createdAt: stamp,
        updatedAt: stamp
      });

      clearSongsCache?.();
      setNotice(t("status_edit_saved"));
      if(addNotice){
        addNotice.style.color = "#059669";
        addNotice.style.background = "rgba(5, 150, 105, 0.1)";
        addNotice.style.border = "1px solid rgba(5, 150, 105, 0.2)";
        addNotice.style.padding = "12px 16px";
        addNotice.style.borderRadius = "8px";
        addNotice.style.marginTop = "16px";
      }
      
      // Mesajı 2 saniye göster, sonra formu temizle ve panel'i kapat
      setTimeout(() => {
        resetForm();
        closePanel();
        if(typeof onSaved === "function") onSaved();
      }, 2000);
    }catch(err){
      setNotice(translateError(err) || t("status_save_failed"), true);
    }
  });

  window.openAddSongPanel = openPanel;

  const openFromHash = () => {
    if(location.hash === "#add-song"){
      openPanel();
    }
  };
  window.addEventListener("hashchange", openFromHash);
  setTimeout(openFromHash, 0);

  return true;
}

// ============================================
// EDIT PANEL ENHANCEMENTS
// ============================================

// Chord validation
const CHORD_PATTERN = /(^|[^0-9\p{L}_])([A-G](?:#|b)?(?:maj|min|dim|aug|sus|add|m|M|\d+|[#b]\d+|[+\-]\d+|[+\-])*(?:\/[A-G](?:#|b)?)?(?:\([^\s)]+\))?)(?=$|[^0-9\p{L}_])/gu;

function validateChords(text){
  const matches = Array.from(text.matchAll(CHORD_PATTERN), match => match[2]);
  const validRoots = ["C","C#","Db","D","D#","Eb","E","F","F#","Gb","G","G#","Ab","A","A#","Bb","B"];
  const errors = [];
  const warnings = [];
  
  matches.forEach(chord => {
    // Extract root note (before any modifiers)
    const rootMatch = chord.match(/^([A-G][#b]?)/);
    if(!rootMatch){
      if(!errors.includes(chord)){
        errors.push(chord);
      }
      return;
    }
    
    const root = rootMatch[1];
    if(!validRoots.includes(root)){
      if(!errors.includes(chord)){
        errors.push(chord);
      }
    }
  });
  
  return { errors, warnings, chordCount: matches.length };
}

// Extract chords from text
function extractChords(text){
  const matches = Array.from(text.matchAll(CHORD_PATTERN), match => match[2]);
  return [...new Set(matches)];
}

// Highlight chords in text (for preview)
function highlightChordsInText(text){
  return escapeHtml(text).replace(CHORD_PATTERN, (match, prefix, chord) => `${prefix}<strong class="chordTok">${chord}</strong>`);
}

// Song templates - akorlar sözlerin üstünde, parantez yok
const SONG_TEMPLATES = {
  verse: "C        Am\nStranên te\nF        G\nBi stranên min\n\nC        Am\nLi hev bûn\nF        G\nEm bûn yek",
  chorus: "C        Am\nNakokî\nF        G\nNakokî",
  bridge: "Am       F\nBridge\nC        G\nBridge"
};

// Common chords for dictionary
const COMMON_CHORDS = [
  "C", "Cm", "C#", "C#m", "Db", "Dbm",
  "D", "Dm", "D#", "D#m", "Eb", "Ebm",
  "E", "Em", "F", "Fm", "F#", "F#m", "Gb", "Gbm",
  "G", "Gm", "G#", "G#m", "Ab", "Abm",
  "A", "Am", "A#", "A#m", "Bb", "Bbm",
  "B", "Bm"
];

// Initialize chord dictionary
function initChordDictionary(containerId, textareaId){
  const container = document.getElementById(containerId);
  const grid = container?.querySelector(".chordDictGrid");
  const textarea = document.getElementById(textareaId);
  
  if(!grid || !textarea) return;
  
  grid.innerHTML = COMMON_CHORDS.map(chord => 
    `<button type="button" class="chordDictBtn" data-chord="${chord}">${chord}</button>`
  ).join("");
  
  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".chordDictBtn");
    if(!btn) return;
    
    const chord = btn.dataset.chord;
    const textareaEl = document.getElementById(textareaId);
    if(!textareaEl) return;
    
    const start = textareaEl.selectionStart;
    const end = textareaEl.selectionEnd;
    const text = textareaEl.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    // Akor parantez olmadan ekleniyor
    textareaEl.value = before + chord + after;
    textareaEl.selectionStart = textareaEl.selectionEnd = start + chord.length;
    textareaEl.focus();
    
    // Trigger input event for validation
    textareaEl.dispatchEvent(new Event("input"));
  });
}

// Update line numbers
function updateLineNumbers(textareaId, lineNumbersId){
  const textarea = document.getElementById(textareaId);
  const lineNumbers = document.getElementById(lineNumbersId);
  
  if(!textarea || !lineNumbers) return;
  
  const text = textarea.value;
  const lines = text.split('\n');
  const currentLine = text.substring(0, textarea.selectionStart).split('\n').length;
  
  // Calculate visible lines based on scroll
  const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight) || 2.2 * 14;
  const scrollTop = textarea.scrollTop;
  const visibleStart = Math.floor(scrollTop / lineHeight);
  const visibleEnd = Math.ceil((scrollTop + textarea.clientHeight) / lineHeight);
  
  lineNumbers.innerHTML = lines.map((line, index) => {
    const lineNum = index + 1;
    const isCurrent = lineNum === currentLine;
    const hasError = false; // Can be enhanced with per-line validation
    
    let className = "lineNumber";
    if(isCurrent) className += " current-line";
    if(hasError) className += " has-error";
    
    return `<span class="${className}" data-line="${lineNum}">${lineNum}</span>`;
  }).join('\n');
  
  // Sync scroll
  lineNumbers.scrollTop = textarea.scrollTop;
}

// Initialize edit panel enhancements
function initEditPanelEnhancements(panelPrefix, textareaId, charCountId, chordCountId, validationId, previewId, previewToggleId){
  const textarea = document.getElementById(textareaId);
  const charCount = document.getElementById(charCountId);
  const chordCount = document.getElementById(chordCountId);
  const validation = document.getElementById(validationId);
  const preview = document.getElementById(previewId);
  const previewToggle = document.getElementById(previewToggleId);
  const lineNumbersId = `${panelPrefix === "add" ? "addSong" : "edit"}LineNumbers`;
  
  if(!textarea) return;
  
  // Character and chord counting
  const updateCounts = () => {
    const text = textarea.value;
    // Boşlukları (space, tab, newline, vb.) çıkararak karakter sayısı
    const textWithoutSpaces = text.replace(/\s+/g, ''); // Tüm whitespace karakterleri
    const charLength = textWithoutSpaces.length;
    if(charCount) charCount.textContent = t("label_char_count", { count: charLength });
    
    const chords = extractChords(text);
    if(chordCount) chordCount.textContent = t("label_chord_count", { count: chords.length });
    
    // Update line numbers
    updateLineNumbers(textareaId, lineNumbersId);
    
    // Validation
    if(validation){
      const validationResult = validateChords(text);
      validation.className = "validationStatus";
      
      if(validationResult.errors.length > 0){
        validation.className += " has-errors";
        validation.textContent = t("validation_invalid_chords", {
          count: validationResult.errors.length,
          list: validationResult.errors.slice(0, 3).join(", ")
        });
      } else if(text.length > 0 && chords.length === 0){
        validation.className += " has-warnings";
        validation.textContent = t("validation_no_chords");
      } else if(text.length > 0){
        validation.className += " is-valid";
        validation.textContent = t("validation_format_ok");
      } else {
        validation.textContent = "";
      }
    }
    
    // Preview
    if(preview){
      preview.innerHTML = highlightChordsInText(text);
    }
  };
  
  // Sync scroll between textarea and line numbers
  const syncScroll = () => {
    const lineNumbers = document.getElementById(lineNumbersId);
    if(lineNumbers) lineNumbers.scrollTop = textarea.scrollTop;
  };
  
  textarea.addEventListener("scroll", syncScroll);
  
  // Update on cursor move (cross-browser compatible)
  const updateCursor = () => {
    updateCounts();
    syncScroll();
  };
  
  textarea.addEventListener("keyup", updateCursor);
  textarea.addEventListener("click", updateCursor);
  textarea.addEventListener("input", () => {
    updateCounts();
    // Small delay to ensure cursor position is updated
    setTimeout(syncScroll, 0);
  });
  
  // Also update on mouse move in textarea
  textarea.addEventListener("mousemove", () => {
    if(document.activeElement === textarea){
      updateCursor();
    }
  });
  
  textarea.addEventListener("input", updateCounts);
  updateCounts();
  
  // Preview toggle
  if(previewToggle && preview){
    previewToggle.addEventListener("click", () => {
      preview.classList.toggle("is-hidden");
      previewToggle.textContent = preview.classList.contains("is-hidden")
        ? t("preview_label")
        : t("action_edit");
    });
  }

  // Template buttons
  const verseBtn = document.getElementById(`${panelPrefix === "add" ? "add" : "edit"}TemplateVerse`);
  const chorusBtn = document.getElementById(`${panelPrefix === "add" ? "add" : "edit"}TemplateChorus`);
  const bridgeBtn = document.getElementById(`${panelPrefix === "add" ? "add" : "edit"}TemplateBridge`);
  
  const insertTemplate = (template) => {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const after = text.substring(end);
    
    const templateText = template + "\n\n";
    textarea.value = before + templateText + after;
    textarea.selectionStart = textarea.selectionEnd = start + templateText.length;
    
    // Textarea yüksekliğini içeriğe göre ayarla
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(300, textarea.scrollHeight) + 'px';
    
    textarea.focus();
    updateCounts();
    
    // Scroll'u en üste al (mobilde görünürlük için)
    setTimeout(() => {
      textarea.scrollTop = 0;
      const lineNumbers = document.getElementById(lineNumbersId);
      if(lineNumbers) lineNumbers.scrollTop = 0;
    }, 50);
  };
  
  if(verseBtn) verseBtn.addEventListener("click", () => insertTemplate(SONG_TEMPLATES.verse));
  if(chorusBtn) chorusBtn.addEventListener("click", () => insertTemplate(SONG_TEMPLATES.chorus));
  if(bridgeBtn) bridgeBtn.addEventListener("click", () => insertTemplate(SONG_TEMPLATES.bridge));
  
  // Format help is now always visible when needed, no toggle button
  
  // Chord dictionary toggle
  const chordDictToggle = document.getElementById(`toggleChordDict${panelPrefix === "add" ? "" : "Edit"}`);
  const chordDictPanel = document.getElementById(`chordDictionary${panelPrefix === "add" ? "" : "Edit"}`);
  if(chordDictToggle && chordDictPanel){
    chordDictToggle.addEventListener("click", () => {
      chordDictPanel.classList.toggle("is-hidden");
    });
    
    // Close on outside click
    document.addEventListener("click", (e) => {
      if(!chordDictPanel.contains(e.target) && !chordDictToggle.contains(e.target)){
        chordDictPanel.classList.add("is-hidden");
      }
    });
  }

  // Keyboard shortcuts
  textarea.addEventListener("keydown", (e) => {
    // Ctrl/Cmd + S: Save
    if((e.ctrlKey || e.metaKey) && e.key === "s"){
      e.preventDefault();
      const saveBtn = document.getElementById(`${panelPrefix === "add" ? "addSong" : "edit"}Save`);
      if(saveBtn) saveBtn.click();
    }
  });
  
  // Key suggestion based on song name
  const songNameInput = document.getElementById(`${panelPrefix === "add" ? "addSong" : "edit"}Name`) || document.getElementById(`${panelPrefix === "add" ? "addSong" : "edit"}Song`);
  const keySuggestion = document.getElementById(`${panelPrefix === "add" ? "addSong" : "editSong"}KeySuggestion`);
  const keySelect = document.getElementById(`${panelPrefix === "add" ? "addSong" : "edit"}Key`);
  
  if(songNameInput && keySuggestion){
    songNameInput.addEventListener("input", () => {
      const songName = songNameInput.value.toLowerCase();
      // Simple heuristic: check if song name contains common key indicators
      const keyMap = {
        "c": "C", "d": "D", "e": "E", "f": "F", "g": "G", "a": "A", "b": "B"
      };
      
      for(const [key, value] of Object.entries(keyMap)){
        if(songName.includes(key)){
          keySuggestion.textContent = t("key_suggestion", { key: value });
          keySuggestion.style.display = "block";
          if(keySelect && !keySelect.value){
            // Auto-select if empty
            const option = Array.from(keySelect.options).find(opt => opt.value === value);
            if(option) keySelect.value = value;
          }
          return;
        }
      }
      keySuggestion.style.display = "none";
    });
  }
}

window.initEditPanelEnhancements = initEditPanelEnhancements;
window.initChordDictionary = initChordDictionary;
window.validateChords = validateChords;
window.extractChords = extractChords;
window.highlightChordsInText = highlightChordsInText;
window.updateLineNumbers = updateLineNumbers;

window.initAddSongPanel = initAddSongPanel;

(function initTheme(){
  document.documentElement.setAttribute("data-theme", "dark");
})();

(function initAddSongMenu(){
  // Hero karttaki giriş butonunu yönet
  const updateHeroLoginBtn = (user) => {
    const heroLoginBtn = document.getElementById("heroLoginBtn");
    if(!heroLoginBtn) return;
    
    if(user){
      // Giriş yapmış kullanıcı için butonu gizle
      heroLoginBtn.style.display = "none";
    } else {
      // Giriş yapmamış kullanıcı için butonu göster
      heroLoginBtn.style.display = "inline-flex";
    }
  };
  
  // Auth state değişikliğini dinle
  if(window.fbAuth){
    window.fbAuth.onAuthStateChanged((user) => {
      updateHeroLoginBtn(user);
    });
  } else {
    // Firebase henüz yüklenmemiş, bekle
    let attempts = 0;
    const waitForAuth = setInterval(() => {
      attempts++;
      if(window.fbAuth){
        clearInterval(waitForAuth);
        window.fbAuth.onAuthStateChanged((user) => {
          updateHeroLoginBtn(user);
        });
        // İlk durumu kontrol et
        updateHeroLoginBtn(window.fbAuth.currentUser);
      } else if(attempts >= 30){
        clearInterval(waitForAuth);
      }
    }, 100);
  }
  
  // Hero login butonuna event listener ekle
  const setupHeroLoginBtn = () => {
    const heroLoginBtn = document.getElementById("heroLoginBtn");
    if(!heroLoginBtn) {
      setTimeout(setupHeroLoginBtn, 200);
      return;
    }
    
    heroLoginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      // Auth panelini aç
      const authOpen = document.getElementById("authOpen");
      if(authOpen) {
        authOpen.click();
      }
    });
  };
  
  // DOM hazır olduğunda hero login butonunu ayarla
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", setupHeroLoginBtn);
  } else {
    setTimeout(setupHeroLoginBtn, 100);
  }
  
  // Topbar'daki Zêdeke butonunu yönet - AGRESIF YÖNTEM
  const setupTopbarButton = () => {
    const btn = document.getElementById("addSongMenuBtn");
    if(!btn) {
      setTimeout(setupTopbarButton, 100);
      return;
    }
    
    // Tüm event listener'ları temizlemek için clone et
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
    
    // Çoklu event listener ekle - kesin çalışsın
    const handleClick = (e) => {
      if(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
      
      // Giriş kontrolü - Firebase beklemeden direkt kontrol et
      const user = window.fbAuth?.currentUser;
      
      if(!user){
        // Giriş yapmamış - auth panelini aç
        if(typeof window.requireAuthAction === "function"){
          window.requireAuthAction(() => {
            setTimeout(() => {
              if(typeof window.openAddSongPanel === "function"){
                window.openAddSongPanel();
              } else {
                const panel = document.getElementById("addSongPanel");
                if(panel){
                  panel.classList.remove("is-hidden");
                  panel.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }
            }, 500);
        }, t("status_requires_login_add"));
      } else {
          const authOpen = document.getElementById("authOpen");
          if(authOpen) authOpen.click();
        }
        return;
      }
      
      // Giriş yapmış - paneli aç
      if(typeof window.openAddSongPanel === "function"){
        window.openAddSongPanel();
      } else {
        const panel = document.getElementById("addSongPanel");
        if(panel){
          panel.classList.remove("is-hidden");
          panel.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          window.location.href = window.appendLangParam
            ? window.appendLangParam("/index.html#add-song")
            : "/index.html#add-song";
        }
      }
    };
    
    // Hem onclick hem addEventListener ekle
    newBtn.onclick = handleClick;
    newBtn.addEventListener("click", handleClick, true); // capture phase
    newBtn.addEventListener("click", handleClick, false); // bubble phase
    newBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      handleClick(e);
    }, true);
  };
  
  // Çoklu deneme - kesin çalışsın
  const initTopbarButton = () => {
    setupTopbarButton();
    setTimeout(setupTopbarButton, 200);
    setTimeout(setupTopbarButton, 500);
    setTimeout(setupTopbarButton, 1000);
    setTimeout(setupTopbarButton, 2000);
    
    if(document.readyState === "loading"){
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(setupTopbarButton, 100);
        setTimeout(setupTopbarButton, 500);
        setTimeout(setupTopbarButton, 1000);
      });
    }
  };
  
  // Hemen başlat ve tekrar tekrar dene
  initTopbarButton();
  
  // Window load'ta da dene
  window.addEventListener("load", () => {
    setTimeout(setupTopbarButton, 100);
    setTimeout(setupTopbarButton, 500);
  });
})();

(function initLiveBackground(){
  if (document.body?.dataset?.noBg === "true") {
    // Di rewşên wek rûpela stranê de çêkirina paşxane
    // varsa eski arka plan parçalarını temizle
    document.getElementById("bgScene")?.remove();
    document.getElementById("bgNotes")?.remove();
    document.querySelector(".bgGrain")?.remove();
    document.querySelector(".bgVignette")?.remove();
    return;
  }
  const staticBg = STATIC_BG === true;
  if(staticBg){
    document.body?.setAttribute("data-static-bg", "true");
  }
  // İki kere eklenmesin
  if (document.getElementById("bgNotes")) return;

  // Grain + vignette + notes container
  const grain = document.createElement("div");
  grain.className = "bgGrain";
  document.body.appendChild(grain);

  const vignette = document.createElement("div");
  vignette.className = "bgVignette";
  document.body.appendChild(vignette);

  const wrap = document.createElement("div");
  wrap.className = "bgNotes";
  wrap.id = "bgNotes";
  document.body.appendChild(wrap);

  // --- PRO scene (ud + davul + hareketli tel) ---
  function ensureProScene(){
    if (document.getElementById("bgScene")) return;

    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = document.createElement("div");
    scene.className = "bgScene";
    scene.id = "bgScene";

    const kilim = document.createElement("div");
    kilim.className = "bgKilim";
    scene.appendChild(kilim);

    const ud = document.createElement("img");
    ud.className = "bgInstrument bgInstrument--ud";
    ud.alt = "";
    ud.decoding = "async";
    ud.src = "/assets/images/ud.png";
    ud.onerror = () => ud.remove();
    scene.appendChild(ud);

    const davul = document.createElement("img");
    davul.className = "bgInstrument bgInstrument--davul";
    davul.alt = "";
    davul.decoding = "async";
    davul.src = "/assets/images/davul.png";
    davul.onerror = () => davul.remove();
    scene.appendChild(davul);

    const canvas = document.createElement("canvas");
    canvas.id = "bgCanvas";
    scene.appendChild(canvas);

    document.body.appendChild(scene);

    const ctx = canvas.getContext("2d", { alpha: true });

    let w = 0, h = 0, dpr = 1;
    let raf = 0;
    let t = 0;
    let mx = 0.5, my = 0.45;

    const strings = [];
    const dust = [];

    const rand = (a,b) => a + Math.random()*(b-a);

    function resize(){
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      w = Math.floor(window.innerWidth);
      h = Math.floor(window.innerHeight);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr,0,0,dpr,0,0);

      strings.length = 0;
      const sCount = Math.max(8, Math.min(14, Math.round(w/170)));
      for(let i=0;i<sCount;i++){
        strings.push({
          y: h*0.16 + i*(h*0.055) + rand(-12,12),
          amp: rand(14, 28),
          freq: rand(0.006, 0.012),
          spd: rand(0.7, 1.25),
          ph: rand(0, Math.PI*2),
          a: rand(0.12, 0.22)
        });
      }

      dust.length = 0;
      const pCount = Math.max(50, Math.min(110, Math.round((w*h)/36000)));
      for(let i=0;i<pCount;i++){
        dust.push({ x: rand(0,w), y: rand(0,h), r: rand(0.7, 2.2), vx: rand(-0.08,0.08), vy: rand(0.03,0.18), a: rand(0.05,0.14) });
      }
    }

    const staticMode = prefersReduced || staticBg;

    function draw(){
      t += 0.016;
      ctx.clearRect(0,0,w,h);

      // soft roj glow
      const gr = ctx.createRadialGradient(w*0.22, h*0.10, 0, w*0.22, h*0.10, Math.min(w,h)*0.60);
      gr.addColorStop(0, "rgba(201,123,32,0.22)");
      gr.addColorStop(1, "rgba(201,123,32,0)");
      ctx.fillStyle = gr;
      ctx.fillRect(0,0,w,h);

      // tel çizgileri
      ctx.lineWidth = 1;
      for(const s of strings){
        const y0 = s.y + (my-0.5)*24;
        ctx.beginPath();
        const steps = 140;
        for(let i=0;i<=steps;i++){
          const x = (i/steps)*w;
          const wave = Math.sin(x*s.freq + (t*s.spd) + s.ph) * s.amp;
          const sway = (mx-0.5)*22;
          const yy = y0 + wave + sway*(i/steps - 0.5);
          if(i===0) ctx.moveTo(x, yy);
          else ctx.lineTo(x, yy);
        }
        ctx.strokeStyle = `rgba(18,21,33,${s.a})`;
        ctx.stroke();
      }

      // toz
      for(const p of dust){
        p.x += p.vx;
        p.y += p.vy;
        if(p.y > h + 24){ p.y = -24; p.x = rand(0,w); }
        if(p.x < -24) p.x = w+24;
        if(p.x > w+24) p.x = -24;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = `rgba(18,21,33,${p.a})`;
        ctx.fill();
      }

      if(!staticMode){
        raf = requestAnimationFrame(draw);
      }
    }

    function onMove(e){
      const pt = e.touches ? e.touches[0] : e;
      mx = (pt.clientX || 0) / Math.max(1, w);
      my = (pt.clientY || 0) / Math.max(1, h);
      mx = Math.max(0, Math.min(1, mx));
      my = Math.max(0, Math.min(1, my));
      scene.style.setProperty("--px", (mx-0.5).toFixed(3));
      scene.style.setProperty("--py", (my-0.5).toFixed(3));
    }

    // parallax via css vars
    const style = document.createElement("style");
    style.textContent = `
      #bgScene .bgInstrument--ud{
        transform: translate3d(calc(var(--px,0)*22px), calc(var(--py,0)*16px), 0) rotate(-8deg);
      }
      #bgScene .bgInstrument--davul{
        transform: translate3d(calc(var(--px,0)*-18px), calc(var(--py,0)*-14px), 0) rotate(8deg);
      }
    `;
    document.head.appendChild(style);

    const onResize = () => {
      resize();
      if(staticMode){
        draw();
      }
    };
    window.addEventListener("resize", onResize, { passive:true });
    if(!staticMode){
      window.addEventListener("mousemove", onMove, { passive:true });
      window.addEventListener("touchmove", onMove, { passive:true });
      document.addEventListener("visibilitychange", () => {
        if(document.hidden){
          cancelAnimationFrame(raf);
          raf = 0;
        }else if(!raf){
          raf = requestAnimationFrame(draw);
        }
      });
    }

    resize();
    if(staticMode){
      draw();
      return;
    }
    raf = requestAnimationFrame(draw);
  }

  ensureProScene();

  // Nota seti: hem evrensel hem “müzik” hissi
  const notes = ["♪","♫","𝄞","♩","♬","♭","♯"];
  const count = Math.min(18, Math.max(12, Math.floor(window.innerWidth / 90)));

  for (let i=0; i<count; i++){
    const n = document.createElement("div");
    n.className = "bgNote";
    n.textContent = notes[Math.floor(Math.random()*notes.length)];

    // Konum ve davranış
    const x = Math.random()*100;                   // vw
    const drift = (Math.random()*10 - 5);          // vw
    const dur = 10 + Math.random()*10;             // s
    const delay = -Math.random()*dur;              // negatif = hemen farklı fazlarda başlar
    const r = (Math.random()*50 - 25);             // deg
    const size = 14 + Math.random()*16;            // px

    if(staticBg){
      n.style.left = `${x}vw`;
      n.style.top = `${Math.random()*100}vh`;
    } else {
      n.style.setProperty("--x", `${x}vw`);
      n.style.setProperty("--drift", `${drift}vw`);
      n.style.setProperty("--dur", `${dur}s`);
      n.style.setProperty("--r", `${r}deg`);
      n.style.animationDelay = `${delay}s`;
    }
    n.style.fontSize = `${size}px`;

    wrap.appendChild(n);
  }
})();

(function initAuthUI(){
  // Modal sistemi kaldırıldı - artık login.html sayfası kullanılıyor
  // Bu fonksiyon sadece butonları güncellemek için kullanılıyor
  const openBtn = document.getElementById("authOpen");
  const profileLink = document.getElementById("profileLink");
  const signOutBtn = document.getElementById("authSignOut");
  const adminLink = document.getElementById("adminLink");
  const langAware = (path) => window.appendLangParam ? window.appendLangParam(path) : path;
  
  // Eğer hiçbir auth butonu yoksa, bu sayfada auth UI yok
  if(!openBtn && !profileLink && !signOutBtn && !adminLink) {
    return;
  }

  const fb = window.firebase;
  let auth = window.fbAuth;
  
  // Firebase henüz yüklenmemişse bekle
  if(!auth && fb && fb.apps && fb.apps.length > 0){
    auth = fb.auth ? fb.auth(fb.apps[0]) : null;
  }
  
  if(!auth){
    // Firebase yüklenmemiş, bekle
    let retryCount = 0;
    const maxRetries = 20; // 10 saniye max bekleme
    const waitForAuth = setInterval(() => {
      retryCount++;
      const checkFb = window.firebase;
      if(checkFb && checkFb.apps && checkFb.apps.length > 0){
        const checkAuth = window.fbAuth || (checkFb.auth ? checkFb.auth(checkFb.apps[0]) : null);
        if(checkAuth){
          clearInterval(waitForAuth);
          // Auth hazır, fonksiyonu tekrar çağır
          setTimeout(() => initAuthUI(), 100);
        }
      }
      if(retryCount >= maxRetries){
        clearInterval(waitForAuth);
        warn("⚠️ Firebase Auth not available after waiting");
      }
    }, 500);
    return;
  }

  // profileLink, adminLink, signOutBtn zaten yukarıda tanımlandı
  
  // Mevcut sayfanın URL'ini al (returnUrl için)
  const currentUrl = window.location.pathname + window.location.search + window.location.hash;

  const setProfileButton = (user) => {
    if(!profileLink) return;
    profileLink.style.display = "inline-flex";
    profileLink.classList.add("profileLink");
    profileLink.setAttribute("aria-label", "Profil");
    profileLink.setAttribute("title", "Profil");
    profileLink.innerHTML = "";
    if(user?.photoURL){
      const img = document.createElement("img");
      img.src = user.photoURL;
      img.alt = "";
      img.className = "profileAvatar";
      profileLink.appendChild(img);
    }else{
      const span = document.createElement("span");
      span.className = "profileAvatar profileAvatar--fallback";
      span.textContent = "👤";
      profileLink.appendChild(span);
    }
  };

  // Firebase hata mesajlarını Kürtçeye çevir
  const translateError = (error) => {
    if(!error) return "Çewtiyek çêbû.";
    
    const code = error.code || "";
    const message = error.message || "";
    
    // Firebase hata kodlarına göre Kürtçe mesajlar
    const errorMap = {
      "auth/unauthorized-domain": "auth_error_unauthorized_domain",
      "auth/popup-blocked": "auth_error_popup_blocked",
      "auth/popup-closed-by-user": "auth_error_popup_closed",
      "auth/network-request-failed": "auth_error_network",
      "auth/too-many-requests": "auth_error_too_many_requests",
      "auth/user-disabled": "auth_error_user_disabled",
      "auth/user-not-found": "auth_error_user_not_found",
      "auth/wrong-password": "auth_error_wrong_password",
      "auth/email-already-in-use": "auth_error_email_in_use",
      "auth/weak-password": "auth_error_weak_password",
      "auth/invalid-email": "auth_error_invalid_email",
      "auth/operation-not-allowed": "auth_error_operation_not_allowed",
      "auth/requires-recent-login": "auth_error_requires_recent_login",
      "auth/credential-already-in-use": "auth_error_credential_in_use"
    };
    
    // Önce kod kontrolü
    if(errorMap[code]) return t(errorMap[code]);
    
    // Sonra mesaj kontrolü (İngilizce mesajları çevir)
    if(message.includes("unauthorized-domain")) return t("auth_error_unauthorized_domain");
    if(message.includes("popup-blocked")) return t("auth_error_popup_blocked");
    if(message.includes("network")) return t("auth_error_network");
    if(message.includes("too many requests")) return t("auth_error_too_many_requests");
    if(message.includes("user not found")) return t("auth_error_user_not_found");
    if(message.includes("wrong password")) return t("auth_error_wrong_password");
    if(message.includes("email already")) return t("auth_error_email_in_use");
    if(message.includes("weak password")) return t("auth_error_weak_password");
    if(message.includes("invalid email")) return t("auth_error_invalid_email");
    
    // Genel mesaj
    return t("auth_error_generic");
  };

  const setStatus = (msg, isError = false) => {
    if(!statusEl) return;
    // Eğer hata mesajı ise ve obje ise çevir
    let displayMsg = msg;
    if(isError && typeof msg === "object" && msg.code){
      displayMsg = translateError(msg);
    } else if(isError && typeof msg === "string" && msg.includes("Firebase:")){
      // Firebase mesajını parse et ve çevir
      const errorObj = { message: msg, code: msg.match(/\(([^)]+)\)/)?.[1] || "" };
      displayMsg = translateError(errorObj);
    }
    statusEl.textContent = displayMsg || "";
    statusEl.style.color = isError ? "#ef4444" : "";
  };

  // googleBtn artık login.html'de, burada gerek yok

  // Hero login butonunu güncelle
  const updateHeroLoginBtn = (user) => {
    const heroLoginBtn = document.getElementById("heroLoginBtn");
    if(heroLoginBtn){
      heroLoginBtn.style.display = user ? "none" : "inline-flex";
    }
  };
  
  // Têkev butonunu login sayfasına yönlendir (eğer link ise)
  const buildLoginUrl = (returnUrl) => {
    const base = `/login.html?return=${encodeURIComponent(returnUrl)}`;
    return langAware(base);
  };
  if(openBtn && openBtn.tagName === "A") {
    openBtn.href = buildLoginUrl(currentUrl);
  }
  
  // Zêdeke butonunu login sayfasına yönlendir (giriş yapmamışsa)
  const addSongBtn = document.getElementById("addSongMenuBtn");
  if(addSongBtn && addSongBtn.tagName === "A") {
    addSongBtn.href = buildLoginUrl(currentUrl);
  }
  
  const setLoggedOut = () => {
    log("setLoggedOut called");
    // Giriş yapmamış - Têkev butonunu göster
    if(openBtn) {
      openBtn.style.display = "inline-flex";
      log("Shown authOpen button");
    }
    if(profileLink) {
      profileLink.style.display = "none";
      log("Hidden profileLink");
    }
    if(signOutBtn) {
      signOutBtn.style.display = "none";
      log("Hidden signOutBtn");
    }
    if(adminLink) adminLink.style.display = "none";
    // Zêdeke butonunu login sayfasına yönlendir
    if(addSongBtn && addSongBtn.tagName === "A") {
      addSongBtn.href = buildLoginUrl(currentUrl);
      addSongBtn.onclick = null;
    }
    updateHeroLoginBtn(null);
  };

  const setLoggedIn = (user) => {
    // Giriş yapmış - Têkev butonunu gizle, Profil'i göster, Derketin'i gizle
    if(openBtn) openBtn.style.display = "none";
    if(profileLink){
      profileLink.style.display = "inline-flex";
      profileLink.href = langAware("/profile.html");
    }
    if(signOutBtn) signOutBtn.style.display = "none"; // Derketin butonu topbarda görünmesin
    setProfileButton(user);
    if(adminLink){
      adminLink.style.display = window.isAdminUser?.(user) ? "inline-flex" : "none";
      if(window.isAdminUser?.(user)){
        adminLink.href = langAware("/admin.html");
      }
    }
    // Zêdeke butonunu şarkı ekleme paneline yönlendir (sadece index.html'de)
    const currentPath = stripLangPrefix(window.location.pathname || "/");
    if(addSongBtn && (currentPath === "/index.html" || currentPath === "/")) {
      if(addSongBtn.tagName === "A") {
        addSongBtn.href = "#add-song";
        addSongBtn.onclick = (e) => {
          e.preventDefault();
          if(typeof window.openAddSongPanel === "function") {
            window.openAddSongPanel();
          } else {
            const panel = document.getElementById("addSongPanel");
            if(panel) {
              panel.classList.remove("is-hidden");
              panel.scrollIntoView({ behavior: "smooth", block: "start" });
            }
          }
        };
      }
    }
    updateHeroLoginBtn(user);
  };
  
  // Derketin butonu
  if(signOutBtn) {
    signOutBtn.addEventListener("click", async () => {
      const ok = window.confirm(t("confirm_sign_out"));
      if(!ok) return;
      try{
        await auth.signOut();
        const target = window.appendLangParam ? window.appendLangParam("/index.html") : "/index.html";
        window.location.href = target;
      }catch(err){
        error("Çıkış hatası:", err);
      }
    });
  }

  // İlk yüklemede mevcut kullanıcıyı kontrol et
  const currentUser = auth.currentUser;
  log("initAuthUI - currentUser:", currentUser ? currentUser.uid : "null");
  if(currentUser){
    log("Setting logged in state for:", currentUser.uid);
    setLoggedIn(currentUser);
    ensureProfile(currentUser);
  } else {
    log("Setting logged out state");
    setLoggedOut();
  }
  
  // Auth state değişikliklerini dinle - sadece bir kez setup et
  if(!window.__authUIListenerSetup){
    window.__authUIListenerSetup = true;
    auth.onAuthStateChanged((user) => {
      log("Auth state changed:", user ? user.uid : "logged out");
      if(user){
        setLoggedIn(user);
        ensureProfile(user);
      }else{
        setLoggedOut();
      }
    });
  }

  // requireAuthAction - artık login sayfasına yönlendiriyor
  window.requireAuthAction = (fn, message) => {
    if(auth.currentUser){
      if(typeof fn === "function") fn();
      return true;
    }
    // Giriş yapmamış - login sayfasına yönlendir
    const returnUrl = currentUrl;
    window.location.href = `/login.html?return=${encodeURIComponent(returnUrl)}`;
    return false;
  };
})();

function updateFilterOptions(user) {
  const filterBy = document.getElementById("filterBy");
  if (!filterBy) return;

  const pendingOption = filterBy.querySelector('option[value="pending"]');

  if (user) {
    if (!pendingOption) {
      const newOption = document.createElement("option");
      newOption.value = "pending";
      newOption.textContent = t("badge_pending");
      filterBy.appendChild(newOption);
    }
  } else {
    if (pendingOption) {
      pendingOption.remove();
      // Ger "Li benda pejirandinê" hat hilbijartin, vegerîne "Hemû"
      if (filterBy.value === "pending") {
        filterBy.value = "all";
        filterBy.dispatchEvent(new Event("change"));
      }
    }
  }
}

window.updateFilterOptions = updateFilterOptions;

// Mobil Search Overlay - Tüm sayfalarda çalışır
(function initMobileSearch() {
  let isInitialized = false;
  
  // Overlay açıkken sayfadaki listelerin güncellenmesini engellemek için flag
  window.__mobileSearchOverlayOpen = false;
  
  // Overlay HTML'ini oluştur
  function createSearchOverlay() {
    // Zaten varsa oluşturma
    if (document.getElementById("searchOverlay")) return;
    
    const overlay = document.createElement("div");
    overlay.id = "searchOverlay";
    overlay.className = "search-overlay";
    overlay.innerHTML = `
      <div class="search-overlay__header">
        <svg class="search-overlay__icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="2" />
          <path d="M16.8 16.8L21 21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        <input 
          id="searchOverlayInput" 
          class="search-overlay__input" 
          type="search" 
          placeholder="${t("search_placeholder")}" 
          autocomplete="off" 
          enterkeyhint="done"
        />
        <button id="searchOverlayClear" class="search-overlay__clear" type="button" aria-label="${t("search_overlay_clear")}">✕</button>
        <button class="search-overlay__close" type="button" aria-label="${t("search_overlay_close")}">&larr;</button>
      </div>
      <div id="searchOverlayResults" class="search-overlay__results"></div>
    `;
    document.body.appendChild(overlay);
  }
  
  // Arama sonuçlarını göster
  let searchRaf = null;
  let searchSongsLoading = false;
  let lastOverlayQuery = "";
  function renderSearchResults(query) {
    const resultsContainer = document.getElementById("searchOverlayResults");
    if (!resultsContainer) return;
    lastOverlayQuery = query;
    
    // Query boşsa önerileri göster
    if (!query || query.trim().length === 0) {
      renderSuggestions();
      return;
    }
    
    // SONGS global değişkeninden şarkıları al
    // Önce window.SONGS'u kontrol et, yoksa window.__songsCache'i dene
    let songs = window.SONGS || window.__songsCache || [];
    
    if (!songs || songs.length === 0) {
      warn("⚠️ renderSearchResults: SONGS not found");
      if (!searchSongsLoading && window.loadSongs && typeof window.loadSongs === "function") {
        searchSongsLoading = true;
        window.loadSongs({ waitForFirebase: false }).then(loadedSongs => {
          if (loadedSongs && loadedSongs.length > 0) {
            window.SONGS = loadedSongs;
            const currentInput = document.getElementById("searchOverlayInput");
            const currentQuery = currentInput?.value ?? lastOverlayQuery;
            renderSearchResults(currentQuery);
          } else {
            resultsContainer.innerHTML = "";
          }
        }).catch(err => {
          error("❌ Error loading songs:", err);
          resultsContainer.innerHTML = "";
        }).finally(() => {
          searchSongsLoading = false;
        });
      } else {
        resultsContainer.innerHTML = "";
      }
      return;
    }
    
    log("✅ renderSearchResults: Found", songs.length, "songs, query:", query);
    
    // Fuzzy search kullan
    const results = window.fuzzySearch ? window.fuzzySearch(query, songs) : songs.filter(s => {
      const searchText = window.norm ? window.norm(`${s.song || ""} ${window.artistText ? window.artistText(s.artist) : ""}`) : "";
      const q = window.norm ? window.norm(query) : query.toLowerCase();
      return searchText.includes(q);
    }).slice(0, 20);
    
    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="search-overlay__empty">
          ${t("search_overlay_no_results")}
        </div>
      `;
      return;
    }
    
    // Sonuçları render et
    const artistText = window.artistText || ((artist) => {
      if (!artist) return "";
      if (Array.isArray(artist)) return artist.join(", ");
      return artist.toString();
    });
    
    const songId = window.songId || ((s) => s._id || s.sourceId || "");
    const buildUrl = window.buildSongUrl || ((song) => {
      const id = songId(song);
      return id ? `/song.html?id=${encodeURIComponent(id)}` : "#";
    });
    
    resultsContainer.innerHTML = `
      <div class="search-overlay__section-title">${t("search_overlay_results")} (${results.length})</div>
      ${results.map(song => {
      const title = song.song || t("label_no_title");
      const artist = artistText(song.artist) || t("label_no_artist");
      const url = buildUrl(song);
      
        return `
          <a href="${url}" class="search-overlay__result-item">
            <div style="flex: 1;">
              <div class="search-overlay__result-title">${escapeHtml(title)}</div>
              <div class="search-overlay__result-artist">${escapeHtml(artist)}</div>
            </div>
          </a>
        `;
      }).join("")}
    `;
  }
  
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Overlay'i aç/kapat
  function toggleSearchOverlay(open) {
    const overlay = document.getElementById("searchOverlay");
    const input = document.getElementById("searchOverlayInput");
    const originalInput = document.querySelector(".search--header .search__input");
    
    if (!overlay || !input) {
      warn("❌ toggleSearchOverlay: overlay or input not found");
      return;
    }
    
    if (open) {
      log("🔍 Opening search overlay...");
      overlay.classList.add("active");
      document.body.classList.add("search-overlay-open");
      // FLAG: Overlay açık - sayfadaki listeler güncellenmesin
      window.__mobileSearchOverlayOpen = true;
      
      // SONGS ve homeSample'ı güncelle (eğer yoksa)
      if (!window.SONGS || window.SONGS.length === 0) {
        // window.__songsCache'i kontrol et
        if (window.__songsCache && window.__songsCache.length > 0) {
          window.SONGS = window.__songsCache;
          log("✅ Using __songsCache, found", window.SONGS.length, "songs");
        }
      }
      
      // homeSample'ı kontrol et ve güncelle
      if ((!window.homeSample || window.homeSample.length === 0) && window.SONGS && window.SONGS.length > 0) {
        if (window.pickRandom) {
          window.homeSample = window.pickRandom(window.SONGS, 10);
        } else {
          // Fallback
          const shuffled = [...window.SONGS].sort(() => 0.5 - Math.random());
          window.homeSample = shuffled.slice(0, 10);
        }
        log("✅ Created homeSample, found", window.homeSample.length, "suggestions");
      }
      
      log("🔍 Current state - SONGS:", window.SONGS?.length || 0, "homeSample:", window.homeSample?.length || 0);
      
      // Orijinal input'un değerini kopyala (sadece görüntü için)
      if (originalInput && originalInput.value) {
        input.value = originalInput.value;
        updateClearButton(input);
        renderSearchResults(input.value);
      } else {
        // Boş açıldığında önerileri göster
        log("🔍 Showing suggestions...");
        renderSuggestions();
      }
      // Focus
      setTimeout(() => {
        input.focus();
      }, 100);
    } else {
      overlay.classList.remove("active");
      document.body.classList.remove("search-overlay-open");
      // FLAG: Overlay kapalı - sayfadaki listeler normal çalışsın
      window.__mobileSearchOverlayOpen = false;
      
      // Overlay kapatıldığında orijinal input'u TEMİZLE
      // Böylece sayfadaki listeler eski haline döner (örneğin "Yên Berçav")
      if (originalInput) {
        originalInput.value = "";
        // Input event'ini tetikle - sayfadaki listeleri eski haline getir
        originalInput.dispatchEvent(new Event("input", { bubbles: true }));
      }
      input.value = "";
      updateClearButton(input);
      input.blur();
      // Sonuçları temizle
      const resultsContainer = document.getElementById("searchOverlayResults");
      if (resultsContainer) {
        resultsContainer.innerHTML = "";
      }
    }
  }
  
  // Clear butonunu güncelle
  function updateClearButton(input) {
    const clearBtn = document.getElementById("searchOverlayClear");
    const header = input?.closest(".search-overlay__header");
    if (!clearBtn || !header) return;
    
    if (input.value.trim()) {
      header.classList.add("has-value");
    } else {
      header.classList.remove("has-value");
    }
  }
  
  // Önerileri göster (yazmaya başlamadan önce)
  function renderSuggestions() {
    const resultsContainer = document.getElementById("searchOverlayResults");
    if (!resultsContainer) {
      warn("❌ searchOverlayResults container not found");
      return;
    }
    
    // SONGS global değişkeninden şarkıları al
    // Önce window.SONGS'u kontrol et, yoksa window.__songsCache'i dene
    let songs = window.SONGS || window.__songsCache || [];
    
    // Eğer hala boşsa, loadSongs fonksiyonunu çağır
    if (!songs || songs.length === 0) {
      warn("⚠️ SONGS not found, trying to load...");
      // loadSongs fonksiyonu varsa çağır
      if (window.loadSongs && typeof window.loadSongs === "function") {
        window.loadSongs({ waitForFirebase: false }).then(loadedSongs => {
          if (loadedSongs && loadedSongs.length > 0) {
            window.SONGS = loadedSongs;
            log("✅ Songs loaded, re-rendering suggestions...");
            renderSuggestions(); // Tekrar dene
          } else {
            warn("⚠️ No songs loaded");
            resultsContainer.innerHTML = "";
          }
        }).catch(err => {
          error("❌ Error loading songs:", err);
          resultsContainer.innerHTML = "";
        });
        return;
      }
      warn("⚠️ loadSongs function not available");
      resultsContainer.innerHTML = "";
      return;
    }
    
    log("✅ renderSuggestions: Found", songs.length, "songs");
    
    // homeSample varsa onu kullan, yoksa random seç
    let suggestions = [];
    if (window.homeSample && window.homeSample.length > 0) {
      suggestions = window.homeSample;
    } else {
      // Random 7 şarkı seç
      if (window.pickRandom) {
        suggestions = window.pickRandom(songs, 10);
      } else {
        // Fallback
        const shuffled = [...songs].sort(() => 0.5 - Math.random());
        suggestions = shuffled.slice(0, 10);
      }
    }
    
    if (suggestions.length === 0) {
      resultsContainer.innerHTML = "";
      return;
    }
    
    // Önerileri render et
    const artistText = window.artistText || ((artist) => {
      if (!artist) return "";
      if (Array.isArray(artist)) return artist.join(", ");
      return artist.toString();
    });
    
    const songId = window.songId || ((s) => s._id || s.sourceId || "");
    const buildUrl = window.buildSongUrl || ((song) => {
      const id = songId(song);
      return id ? `/song.html?id=${encodeURIComponent(id)}` : "#";
    });
    
    resultsContainer.innerHTML = `
      <div class="search-overlay__section-title">${t("search_overlay_suggestions")}</div>
      ${suggestions.map(song => {
        const title = song.song || t("label_no_title");
        const artist = artistText(song.artist) || t("label_no_artist");
        const url = buildUrl(song);
        
        return `
          <a href="${url}" class="search-overlay__result-item">
            <div style="flex: 1;">
              <div class="search-overlay__result-title">${escapeHtml(title)}</div>
              <div class="search-overlay__result-artist">${escapeHtml(artist)}</div>
            </div>
          </a>
        `;
      }).join("")}
    `;
  }
  
  // Overlay'i başlat
  function setupSearchOverlay() {
    log("🔍 setupSearchOverlay called");
    createSearchOverlay();
    
    const overlay = document.getElementById("searchOverlay");
    const input = document.getElementById("searchOverlayInput");
    const closeBtn = overlay?.querySelector(".search-overlay__close");
    const clearBtn = document.getElementById("searchOverlayClear");
    const searchIcon = document.querySelector(".search--header .search__icon");
    
    log("🔍 Overlay:", overlay);
    log("🔍 Input:", input);
    log("🔍 Search Icon:", searchIcon);
    
    if (!overlay || !input) {
      warn("❌ Search overlay elements not found");
      return;
    }
    
    if (!searchIcon) {
      warn("❌ Search icon not found, retrying...");
      // Biraz bekleyip tekrar dene
      setTimeout(() => {
        const retryIcon = document.querySelector(".search--header .search__icon");
        const retryHeader = document.querySelector(".topbar__actions .search--header");
        
        if (retryIcon) {
          log("✅ Search icon found on retry");
          retryIcon.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            log("🔍 Search icon clicked, opening overlay");
            toggleSearchOverlay(true);
          });
        }
        
        // Search header'a da event ekle
        if (retryHeader && !retryHeader.dataset.searchListenerAdded) {
          retryHeader.addEventListener("click", (e) => {
            if (e.target.classList.contains("search__input") || 
                e.target.classList.contains("search__clear") ||
                e.target.closest(".search__clear")) {
              return;
            }
            e.preventDefault();
            e.stopPropagation();
            log("🔍 Search header clicked, opening overlay");
            toggleSearchOverlay(true);
          });
          retryHeader.dataset.searchListenerAdded = "true";
        }
        
        if (!retryIcon && !retryHeader) {
          error("❌ Search icon and header still not found after retry");
        }
      }, 500);
      // return kaldırıldı - search header'a da event ekleyebilmek için devam et
    }
    
    // Search icon'a tıklayınca overlay'i aç
    if (searchIcon) {
      searchIcon.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        log("🔍 Search icon clicked, opening overlay");
        toggleSearchOverlay(true);
      });
    }
    
    // Search header container'a da click event ekle (mobilde buton gibi davranıyor)
    const searchHeader = document.querySelector(".topbar__actions .search--header");
    if (searchHeader) {
      // Eğer zaten event listener varsa tekrar ekleme
      if (!searchHeader.dataset.searchListenerAdded) {
        searchHeader.addEventListener("click", (e) => {
          // Eğer input veya clear butonuna tıklandıysa işleme
          if (e.target.classList.contains("search__input") || 
              e.target.classList.contains("search__clear") ||
              e.target.closest(".search__clear")) {
            return;
          }
          e.preventDefault();
          e.stopPropagation();
          console.log("🔍 Search header clicked, opening overlay");
          toggleSearchOverlay(true);
        });
        searchHeader.dataset.searchListenerAdded = "true";
      }
    }
    
    log("✅ Search overlay setup complete");
    
    // Close butonu: sadece klavyeyi kapat, overlay'i kapatma
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        input.blur();
      });
    }
    
    // Clear butonuna tıklayınca temizle
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        input.value = "";
        updateClearButton(input);
        renderSuggestions(); // Önerileri göster
        input.focus();
        // Orijinal input'u temizle ama event tetikleme - sayfadaki listeleri güncellemesin
        const originalInput = document.querySelector(".search--header .search__input");
        if (originalInput) {
          originalInput.value = "";
          // Event tetikleme - overlay açıkken sayfadaki listeler değişmesin
        }
      });
    }
    
    let isComposing = false;
    const isDoneKey = (key) => (
      key === "Enter" || key === "Go" || key === "Done" || key === "Search"
    );
    const scheduleOverlaySearch = (value) => {
      updateClearButton(input);
      lastOverlayQuery = value;
      if (searchRaf) cancelAnimationFrame(searchRaf);
      searchRaf = requestAnimationFrame(() => {
        renderSearchResults(value);
      });
    };
    
    // Input değişikliklerini dinle - anlık arama
    input.addEventListener("input", (e) => {
      if (isComposing) return;
      scheduleOverlaySearch(e.target.value);
      // ÖNEMLİ: Mobil search overlay'de arama yapıldığında 
      // orijinal input'a değer KOPYALAMA - sayfadaki listeleri güncellemesin
      // Overlay açıkken sayfadaki listeler değişmesin, sadece overlay içinde sonuçlar görünsün
      // Orijinal input'a değer kopyalamayı tamamen kaldırdık
    });
    
    input.addEventListener("compositionstart", () => {
      isComposing = true;
    });
    
    input.addEventListener("compositionend", (e) => {
      isComposing = false;
      scheduleOverlaySearch(e.target.value);
    });
    
    input.addEventListener("keyup", (e) => {
      if (isComposing) return;
      if (isDoneKey(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        input.blur();
        return;
      }
      scheduleOverlaySearch(e.target.value);
    });
    
    input.addEventListener("search", (e) => {
      if (isComposing) return;
      scheduleOverlaySearch(e.target.value);
      input.blur();
    });
    
    // ESC tuşu ile kapat, Enter/Go ile klavyeyi kapat (navigasyon yapma)
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        toggleSearchOverlay(false);
        return;
      }
      if (isDoneKey(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        input.blur();
      }
    });
    
    // Overlay'e tıklayınca kapat (input wrapper ve results'a değil)
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        toggleSearchOverlay(false);
      }
    });
  }
  
  function setupMobileSearch() {
    // Sadece mobilde çalışsın
    if (window.innerWidth > 639) {
      // Desktop'a geçildiyse overlay'i kapat ve temizle
      const overlay = document.getElementById("searchOverlay");
      if (overlay) {
        overlay.classList.remove("active");
        document.body.classList.remove("search-overlay-open");
      }
      isInitialized = false;
      return;
    }
    
    // Zaten initialize edilmişse tekrar etme
    if (isInitialized) return;
    isInitialized = true;
    
    // DOM hazır olana kadar bekle
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        setTimeout(setupSearchOverlay, 300);
      });
    } else {
      setTimeout(setupSearchOverlay, 300);
    }
  }
  
  // Resize'da kontrol et (mobilden desktop'a geçiş)
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (window.innerWidth > 639) {
        const overlay = document.getElementById("searchOverlay");
        if (overlay && overlay.classList.contains("active")) {
          toggleSearchOverlay(false);
        }
        isInitialized = false; // Desktop'a geçildiğinde tekrar initialize edilebilir
      } else if (window.innerWidth <= 639 && !isInitialized) {
        // Mobil'e geri dönüldüğünde initialize et
        setupMobileSearch();
      }
    }, 100);
  });
  
  // İlk setup - DOM hazır olduğunda
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(setupMobileSearch, 200);
    });
  } else {
    // DOM zaten hazırsa hemen çalıştır
    setTimeout(setupMobileSearch, 200);
  }
})();
