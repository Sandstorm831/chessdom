// import { getEngineState } from "@/lib/features/engine/engineSlice";
// import { useAppSelector } from "@/lib/hooks";
export default function engineStarter() {
  // if (useAppSelector(getEngineState) !== "ready") {
  const x = new window.Worker("../public/lib/loadEngine");
  // }
}
