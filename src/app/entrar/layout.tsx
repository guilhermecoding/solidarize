export default function LoginLayout({ children }: LayoutProps<"/entrar">) {
  return (
    <>
      <script
        id="login-default-theme"
        dangerouslySetInnerHTML={{
          __html: `(function(){try{if(!localStorage.getItem("theme")){var root=document.documentElement;root.classList.remove("dark");root.classList.add("light");root.style.colorScheme="light"}}catch(e){}})();`,
        }}
      />
      {children}
    </>
  );
}
