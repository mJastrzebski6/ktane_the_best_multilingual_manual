import { useAppStore } from "../store/AppStore";

export default function Password() {
  const t = useAppStore((s) => s.t);

  return (
    <>
      <div>Password</div>
      {t.passwordWords.map((element: string) => {
        return <div key={element}>{element}</div>;
      })}
    </>
  );
}
