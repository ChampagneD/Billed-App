/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";
import mockStore from "../__mocks__/store";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      //to-do write assertion
    });
  });
});
// On utilise Object.defineProperty pour ajouter une propriété à l'objet window
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// On stocke une valeur dans localStorage en utilisant window.localStorage.setItem
// en lui fournissant une clé "user" et une valeur sous la forme d'une chaîne JSON
window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

// On définit une fonction onNavigate qui prend un paramètre pathname
// et modifie le contenu HTML de la page en utilisant la fonction ROUTES
// et en lui fournissant pathname
const onNavigate = (pathname) => {
  document.body.innerHTML = ROUTES({ pathname });
};

describe("Given I am connected as an employee, When I upload a file", () => {
  test("Then i upload the right format, the file should be send", () => {
    // Créer une instance de NewBillUI et générer le code HTML pour l'interface utilisateur
    const pageContent = NewBillUI();
    // Remplacer le contenu de l'élément <body> par le code HTML généré
    document.body.innerHTML = pageContent;

    // Créer une nouvelle instance de NewBill avec des dépendances mock injectées
    const newBillMock = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: localStorageMock,
    });

    // Mettre en place un écouteur pour l'événement "change" sur l'élément <input type="file">
    const handleChangeFileTest = jest.fn((e) =>
      newBillMock.handleChangeFile(e)
    );
    const files = screen.getByTestId("file");
    const testFormat = new File(["it's a test"], "test.png", {
      type: "image/png",
    });
    files.addEventListener("change", handleChangeFileTest);
    // Simuler une sélection de fichier
    fireEvent.change(files, { target: { files: [testFormat] } });

    // Vérifier que le fichier a été correctement attaché à l'élément <input> et que la fonction handleChangeFile a été appelée
    expect(handleChangeFileTest).toHaveBeenCalled();
    expect(files.files[0]).toStrictEqual(testFormat);

    const formNewBill = screen.getByTestId("form-new-bill");

    // Vérifier que le formulaire existe
    expect(formNewBill).toBeTruthy();

    // Mettre en place un écouteur pour l'événement "submit" sur le formulaire
    const handleSubmitTest = jest.fn((e) => newBillMock.handleSubmit(e));
    formNewBill.addEventListener("submit", handleSubmitTest);

    // On simule une soumission de formulaire
    fireEvent.submit(formNewBill);

    // On verifie que la fonction handleSubmit a été appelée et que le texte attendu est affiché sur la page
    expect(handleSubmitTest).toHaveBeenCalled();
    expect(screen.getByText("Mes notes de frais")).toBeTruthy();
  });

  test("fetches messages from an API and fails with 500 message error", async () => {
    jest.spyOn(mockStore, "bills");

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
    });

    Object.defineProperty(window, "location", {
      value: { hash: ROUTES_PATH["NewBill"] },
    });

    window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
    document.body.innerHTML = `<div id="root"></div>`;
    router();

    window.onNavigate(ROUTES_PATH.NewBill);

    const newBillContainer = new NewBill({
      document,
      onNavigate,
      store: mockStore,
      localStorage: window.localStorage,
    });

    mockStore.bills.mockImplementationOnce(() => {
      return {
        update: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });

    const event = {
      preventDefault: jest.fn(),
    };

    const form = screen.getByTestId("form-new-bill");
    const handleSubmit = jest.fn((event) =>
      newBillContainer.handleSubmit(event)
    );
    form.addEventListener("submit", handleSubmit);
    fireEvent.submit(form);
    await new Promise(process.nextTick);
  });
});
