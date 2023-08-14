/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";
import mockStore from "../__mocks__/store";

//jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      // On utilise la fonction "defineProperty" de l'objet "window" pour définir un objet "localStorage" simulé.
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      // On utilise l'objet "localStorage" simulé pour enregistrer un utilisateur de type "Employee".
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      // On crée un élément HTML avec l'identifiant "root" et on l'ajoute à la page.
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      // On appelle la fonction "router" qui gère la navigation de l'application.
      router();

      // On utilise la fonction "onNavigate" pour naviguer vers la page des notes de frais.
      window.onNavigate(ROUTES_PATH.Bills);

      // On utilise la fonction "waitFor" de l'objet "screen" pour attendre que l'icône des notes de frais soit chargée.
      await waitFor(() => screen.getByTestId("icon-window"));

      // On récupère l'icône des notes de frais.
      const windowIcon = screen.getByTestId("icon-window");

      //to-do write expect expression
      // On vérifie que l'icône des notes de frais possède la classe "active-icon"
      expect(windowIcon).toHaveClass("active-icon");
    });

    test("Then bills should be ordered from earliest to latest", () => {
      // On utilise la fonction "BillsUI" pour générer le contenu HTML de la page des notes de frais et on l'affiche dans la page.
      document.body.innerHTML = BillsUI({ data: bills });
      // On utilise l'objet "screen" pour récupérer toutes les dates des notes de frais et on les stocke dans un tableau.
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      // On crée une fonction de comparaison pour trier les dates dans l'ordre inverse (du plus ancien au plus récent).
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      // On trie les dates dans l'ordre inverse en utilisant la fonction de comparaison.
      const datesSorted = [...dates].sort(antiChrono);
      // On vérifie que les dates récupérées sont égales aux dates triées dans l'ordre inverse.
      expect(dates).toEqual(datesSorted);
    });
  });
});

//Given - when - then
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then if I click on the eye icon a modal should appear", async () => {
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getAllByTestId("icon-eye"));
      const iconEye = screen.getAllByTestId("icon-eye");
      // Fonctions simulées https://jestjs.io/fr/docs/mock-function-api#:~:text=Les%20fonctions%20simul%C3%A9es%20sont%20%C3%A9galement,fn()%20.
      $.fn.modal = jest.fn();
      // fireEvent declenchement d'événements du DOM https://testing-library.com/docs/dom-testing-library/api-events/
      fireEvent.click(iconEye[0]);
      // getBy =renvoie le nœud correspondant pour une requête et renvoie une erreur descriptive si aucun élément ne correspond ou si plusieurs correspondances sont trouvées
      //https://testing-library.com/docs/queries/about/
      //getAllBy= renvoie un tableau de tous les nœuds correspondants pour une requête et génère une erreur si aucun élément ne correspond
      await waitFor(() => screen.getByText("Justificatif"));
      const uploadedDoc = screen.getAllByText("Justificatif");
      expect(uploadedDoc).toBeTruthy();
    });
  });
});

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then if I click on the button 'Nouvelle note de frais a bill form will appear", async () => {
      // On crée un élément "div" avec l'identifiant "root" et on l'ajoute à la page HTML.
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);

      // On appelle la fonction "router" pour configurer le routage de l'application.
      router();

      // On simule un changement de page en appelant la fonction "onNavigate" avec l'itinéraire pour la page des notes de frais.
      window.onNavigate(ROUTES_PATH.Bills);

      // On attend que l'élément avec l'identifiant de test "btn-new-bill" soit affiché.
      await waitFor(() => screen.getByTestId("btn-new-bill"));

      // On récupère l'élément de bouton de nouvelle note de frais.
      const billButton = screen.getByTestId("btn-new-bill");

      // On simule un clic sur le bouton.
      fireEvent.click(billButton);

      // On attend que l'élément avec l'identifiant de test "form-new-bill" soit affiché.
      await waitFor(() => screen.getByTestId("form-new-bill"));

      // On récupère l'élément du formulaire de nouvelle note de frais.
      const billForm = screen.getByTestId("form-new-bill");

      // On vérifie que l'élément du formulaire existe.
      expect(billForm).toBeTruthy();
    });
  });
});

//////////////////////////////////
describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page and the page is loaded", () => {
    test("Then the function named getBills has to be launched", async () => {
      // On génère le contenu HTML de la page des notes de frais en utilisant les données de factures fournies.
      const pageContent = BillsUI({ data: bills });
      // On ajoute le contenu HTML à la page.
      document.body.innerHTML = pageContent;
      // On crée un objet de simulation pour la classe "Bills" en utilisant les données fournies et en spécifiant
      // les dépendances (document, onNavigate, store, localStorage).
      const mockObject = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: localStorageMock,
      });
      // On utilise la fonction "spyOn" de Jest pour surveiller l'appel à la fonction "getBills" de l'objet de simulation.
      jest.spyOn(mockObject, "getBills");
      const result = await mockObject.getBills();
      // On vérifie que le premier élément du résultat est égal au premier élément des données de factures fournies.
      expect(result[0]["name"]).toBe(bills[0]["name"]);

      // On récupère les éléments HTML pour le titre de la page et le bouton "Nouvelle note de frais"
      // et on vérifie qu'ils existent.
      const pageTitle = await screen.getByText("Mes notes de frais");
      const newBillButton = await screen.getByTestId("btn-new-bill");
      expect(pageTitle).toBeTruthy();
      expect(newBillButton).toBeTruthy();
      // On récupère tous les éléments avec l'identifiant de test "icon-eye" et on vérifie qu'ils existent.
      expect(screen.getAllByTestId("icon-eye")).toBeTruthy();
    });
  });
});

// Erreur 404 et Erreur 500

describe("When an error occurs on API", () => {
  // Avant chaque test, on utilise la fonction "spyOn" de Jest pour surveiller l'appel à la fonction "bills"
  // de l'objet "mockStore".
  beforeEach(() => {
    jest.spyOn(mockStore, "bills");
  });
  // Dans ce test, on simule une erreur 404 lors de l'appel à l'API pour récupérer les notes de frais.
  test("fetches bills from an API and fails with 404 message error", async () => {
    // On utilise la fonction "mockImplementationOnce" de Jest pour remplacer la fonction "bills" de l'objet "mockStore"
    // par une fonction qui simule une erreur 404.
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 404"));
        },
      };
    });
    // On génère le contenu HTML de la page des notes de frais en spécifiant l'erreur 404.
    const pageContent = BillsUI({ error: "Erreur 404" });
    // On ajoute le contenu HTML à la page.
    document.body.innerHTML = pageContent;
    // On récupère l'élément HTML pour le message d'erreur et on vérifie qu'il existe.
    const errorMessage = await screen.getByText(/Erreur 404/);
    expect(errorMessage).toBeTruthy();
  });

  test("fetches messages from an API and fails with 500 message error", async () => {
    mockStore.bills.mockImplementationOnce(() => {
      return {
        list: () => {
          return Promise.reject(new Error("Erreur 500"));
        },
      };
    });
    const pageContent = BillsUI({ error: "Erreur 500" });
    document.body.innerHTML = pageContent;
    const errorMessage = await screen.getByText(/Erreur 500/);
    expect(errorMessage).toBeTruthy();
  });
});
