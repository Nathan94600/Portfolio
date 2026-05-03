const buttons = document.querySelector(".buttons");
const articles = document.querySelector("#articles");

if (buttons && articles)
  for (const button of buttons?.children)
    if (button instanceof HTMLButtonElement)
      button.addEventListener("click", () => {
        const buttonType = button.id.split("-")[0];

        if (buttonType === "all")
          for (const article of articles?.children) {
            if (article instanceof HTMLDivElement)
              article.style.display = "flex";
            else
              article.style.display = "none";
          }
        else
          for (const article of articles?.children) {
            if (article instanceof HTMLDivElement && article.classList.contains(buttonType))
              article.style.display = "flex";
            else
              article.style.display = "none";
          }
      });
