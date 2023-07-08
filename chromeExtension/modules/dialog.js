export function showDialog(modal, heading, content) {
    let backdrop = document.getElementById("backdrop");
    modal.innerHTML = ""; // Clear content

    // Forming heading
    let h = document.createElement('h3');
    h.textContent = heading;
    modal.appendChild(h);

    // Check if body is valid
    if (content != null) {
        modal.appendChild(content);
    }

    modal.showModal();
    backdrop.style.display = "block";
    modal.addEventListener("click", dismissDialogHandler);
}

function dismissDialogHandler(e) {
    let backdrop = document.getElementById("backdrop");
    if (e.target.tagName !== 'DIALOG') //This prevents issues with forms
        return;

    const rect = e.target.getBoundingClientRect();

    const clickedInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
    );

    if (clickedInDialog === false)
        backdrop.style.display = "none";
        e.target.close();
}