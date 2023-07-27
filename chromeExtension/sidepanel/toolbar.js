let iconPathes = {
    'close': "../assets/xmark-solid.svg",
    'mini': "../assets/minus-solid.svg",
    'logo': "../assets/logo.jpeg",
    'settings': "../assets/gear-solid.svg",
    'save': "../assets/floppy-disk-solid.svg",
    'regen': "../assets/arrows-rotate-solid.svg",
    'openAll': "../assets/box-open.svg"
}

export function getButton(id, left, action=null) {
    let button = document.createElement("div")
    button.className = "icon-wrap"; if (left) { button.classList.add("left")}
    button.id = id;

    let icon = document.createElement("img")
    icon.className = "icon"; icon.src = iconPathes[id];
    button.appendChild(icon);

    if (action != null) {
        button.addEventListener("click", async function () {
            await action();
        })
    }

    return button;
}

