import WireHorizontal from "./WireHorizontal";
import WireVertical from "./WireVertical";
import WireABC from "./WireABC";
import BigButton from "./BigButton";
import Keypad from "./Keypad";
import Maze from "./Maze";
import Memory from "./Memory";
import Morse from "./Morse";
import NeedyKnob from "./NeedyKnob";
import Password from "./Password";
import Simon from "./Simon";
import WhosOnFirst from "./WhosOnFirst ";
import type { ViewId } from "../store/AppStore";
import type { JSX } from "react";

export const viewMap: Record<ViewId, JSX.Element> = {
  wire_horizontal: <WireHorizontal />,
  wire_vertical: <WireVertical />,
  wire_ABC: <WireABC />,
  big_button: <BigButton />,
  keypad: <Keypad />,
  maze: <Maze />,
  memory: <Memory />,
  morse: <Morse />,
  needy_knob: <NeedyKnob />,
  password: <Password />,
  simon: <Simon />,
  whos_on_first: <WhosOnFirst />,
};
