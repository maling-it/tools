// A tiny shared announcer for screen readers: `announce("Copied")` is read out through the live region in AppStatus.
let message = $state("");
let timer = 0;

export const announcer = {
    get message() {
        return message;
    }
};

export const announce = (text) => {
    // Clear first so announcing the same sentence twice is still read out.
    message = "";
    clearTimeout(timer);
    timer = setTimeout(() => {
        message = text;
        timer = setTimeout(() => (message = ""), 4000);
    }, 50);
};
