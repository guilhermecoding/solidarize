import { redirect } from "next/navigation";

/**
 * Redireciona a rota vazia /cestas/alimentos para o hub /cestas.
 */
export default function FoodsRedirectPage() {
    redirect("/cestas");
}
