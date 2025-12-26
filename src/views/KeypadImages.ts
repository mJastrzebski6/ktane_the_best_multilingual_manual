// KeypadImages.ts
import venus from "../images/Keypad/venus.png";
import a from "../images/Keypad/a.png";
import lambda from "../images/Keypad/lambda.png";
import zigzag_n from "../images/Keypad/zigzag_n.png";
import h_triangle from "../images/Keypad/h_triangle.png";
import curly_y from "../images/Keypad/curly_y.png";
import backwards_e from "../images/Keypad/backwards_e.png";

import e_umlaut from "../images/Keypad/e_umlaut.png";
import omega_loop from "../images/Keypad/omega_loop.png";
import star_outline from "../images/Keypad/star_outline.png";
import hook_i from "../images/Keypad/hook_i.png";

import copyright from "../images/Keypad/copyright.png";
import heart from "../images/Keypad/heart.png";
import zhe_tail from "../images/Keypad/zhe_tail.png";
import hook_r from "../images/Keypad/hook_r.png";

import six from "../images/Keypad/six.png";
import pilcrow from "../images/Keypad/pilcrow.png";
import cyrillic_be from "../images/Keypad/cyrillic_be.png";
import cup_dots from "../images/Keypad/cup_dots.png";

import psi from "../images/Keypad/psi.png";
import c_letter from "../images/Keypad/c_letter.png";
import three_hook from "../images/Keypad/three_hook.png";
import star_filled from "../images/Keypad/star_filled.png";

import hash from "../images/Keypad/hash.png";
import ae from "../images/Keypad/ae.png";
import cyrillic_iy from "../images/Keypad/cyrillic_iy.png";
import omega from "../images/Keypad/omega.png";

export const KeypadImageById = {
  venus,
  a,
  lambda,
  zigzag_n,
  h_triangle,
  curly_y,
  backwards_e,
  e_umlaut,
  omega_loop,
  star_outline,
  hook_i,
  copyright,
  heart,
  zhe_tail,
  hook_r,
  six,
  pilcrow,
  cyrillic_be,
  cup_dots,
  psi,
  c_letter,
  three_hook,
  star_filled,
  hash,
  ae,
  cyrillic_iy,
  omega,
} as const;

export type SymbolId = keyof typeof KeypadImageById;
