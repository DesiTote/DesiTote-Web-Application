import { Review } from '../types';

import logoImg from '../assets/images/logo.jpg';
import brandTexture from '../assets/images/brand_texture.jpg';

import hoboBlack from '../assets/images/hobo_black.jpg';
import hoboWhite from '../assets/images/hobo_white.jpg';
import singleFlapBlack from '../assets/images/single_flap_black.jpg';
import singleFlapWhite from '../assets/images/single_flap_white.jpg';
import doublePocketBlack from '../assets/images/double_pocket_black.jpg';
import doublePocketWhite from '../assets/images/double_pocket_white.jpg';
import hoboFrontPocketBlack from '../assets/images/hobo_frontpocket_black.jpg';
import hoboFrontPocketWhite from '../assets/images/hobo_frontpocket_white.jpg';

import printMushroom from '../assets/images/print_mushroom.jpg';
import printSunflowerQuoteBlack from '../assets/images/print_sunflower_quote_black.jpg';
import printDaisyOffwhite from '../assets/images/print_daisy_offwhite.jpg';
import printSunflowerMotif from '../assets/images/print_sunflower_motif.jpg';

// Newer, clearer real product photos from the client (replace earlier PDF-extracted crops)
import printKeepKaamNatural from '../assets/images/print_keepkaam_natural_v2.jpg';
import printKeepKaamBlack from '../assets/images/print_keepkaam_black_v2.jpg';
import printNamasteNatural from '../assets/images/print_namaste_natural_v2.jpg';

// New design mockups
import printBookGirlNatural from '../assets/images/print_bookgirl_natural.jpg';
import printBookGirlBlack from '../assets/images/print_bookgirl_black.jpg';
import printBuriNazar from '../assets/images/print_burinazar_black.jpg';
import printEmotionalBaggage from '../assets/images/print_emotionalbaggage_natural.jpg';
import printGoodVibes from '../assets/images/print_goodvibes_black.jpg';
import printKaleshiAurat from '../assets/images/print_kaleshiaurat_natural.jpg';
import printKarma from '../assets/images/print_karma_black.jpg';
import printMoneyfestingNatural from '../assets/images/print_moneyfesting_natural.jpg';
import printMoneyfestingBlack from '../assets/images/print_moneyfesting_black.jpg';
import printSpillChai from '../assets/images/print_spillchai_black.jpg';

// New color variants for existing prints
import printDaisyBlack from '../assets/images/print_daisy_black.jpg';
import printMushroomBlack from '../assets/images/print_mushroom_black.jpg';

// Newest design drop (three batches of client mockups)
import printFingerprintHeartBlack from '../assets/images/print_fingerprint_heart_black.jpg';
import printFingerprintHeartNatural from '../assets/images/print_fingerprint_heart_natural.jpg';
import printPurpleFloralBlack from '../assets/images/print_purple_floral_black.jpg';
import printEvilEyeBlack from '../assets/images/print_evil_eye_black.jpg';
import printEvilEyeNatural from '../assets/images/print_evil_eye_natural.jpg';
import printBlueFloralBlack from '../assets/images/print_blue_floral_black.jpg';
import printHanumanNatural from '../assets/images/print_hanuman_natural.jpg';
import printHanumanBlack from '../assets/images/print_hanuman_black.jpg';
import printHarHarMahadevBlack from '../assets/images/print_har_har_mahadev_black.jpg';
import printHarHarMahadevNatural from '../assets/images/print_har_har_mahadev_natural.jpg';
import printDolphinNatural from '../assets/images/print_dolphin_natural.jpg';
import printDolphinBlack from '../assets/images/print_dolphin_black.jpg';
import printCatHeartBlack from '../assets/images/print_cat_heart_black.jpg';
import printCatHeartNatural from '../assets/images/print_cat_heart_natural.jpg';
import printQueenNatural from '../assets/images/print_queen_natural.jpg';
import printPoppyBlack from '../assets/images/print_poppy_black.jpg';
import printCatBasketBlack from '../assets/images/print_cat_basket_black.jpg';
import printBearHeartNatural from '../assets/images/print_bear_heart_natural.jpg';
import printBearHeartBlack from '../assets/images/print_bear_heart_black.jpg';
import printWhiteFloralBlack from '../assets/images/print_white_floral_black.jpg';
import printCatBoxNatural from '../assets/images/print_cat_box_natural.jpg';
import printDawaKaaljiBlack from '../assets/images/print_dawa_kaalji_black.jpg';
import printCatPeekNatural from '../assets/images/print_cat_peek_natural.jpg';
import printElephantNatural from '../assets/images/print_elephant_natural.jpg';
import printElephantBlack from '../assets/images/print_elephant_black.jpg';
import printGiraffePeekBlack from '../assets/images/print_giraffe_peek_black.jpg';
import printGiraffePeekNatural from '../assets/images/print_giraffe_peek_natural.jpg';
import printGiraffeBigEyesNatural from '../assets/images/print_giraffe_bigeyes_natural.jpg';
import printGiraffeAmazingBlack from '../assets/images/print_giraffe_amazing_black.jpg';
import printScatteredHeartsNatural from '../assets/images/print_scattered_hearts_natural.jpg';
import printHandEyeNatural from '../assets/images/print_hand_eye_natural.jpg';
import printModernFloralBlack from '../assets/images/print_modern_floral_black.jpg';
import printRetroFlowerBlack from '../assets/images/print_retro_flower_black.jpg';
import printBirdhouseBlack from '../assets/images/print_birdhouse_black.jpg';
import printSunshineBlack from '../assets/images/print_sunshine_black.jpg';
import plainPocketToteNatural from '../assets/images/plain_pocket_tote_natural.jpg';

export const KALESHI_AURAT_IMAGE = printKaleshiAurat;

export const LOGO_IMAGE = logoImg;
export const HERO_IMAGE = printMushroom;
export const BRAND_TEXTURE_IMAGE = brandTexture;


// NOTE: the PRODUCTS catalog previously here now lives in MongoDB (see backend/src/scripts/seedData.ts for the migration source) and is fetched live via ProductsContext. Only REVIEWS below is still used as local seed data.

// No reviews are seeded — real customer reviews will appear here as they
// come in through the "Write a Review" flow on the site.
export const REVIEWS: Review[] = [];
