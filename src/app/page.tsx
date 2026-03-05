import Home from "@/components/Home";
import { getSneakPeeks } from "@/lib/sneakPeeks";

export default function Page() {
  const sneakPeeks = getSneakPeeks().slice(0, 3);
  return <Home sneakPeeks={sneakPeeks} />;
}
