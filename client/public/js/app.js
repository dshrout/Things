let auth0 = null;

const fetchAuthConfig = () => fetch("/auth_config.json");

const configureClient = async () => {
    const response = await fetchAuthConfig();
    const config = await response.json();
    auth0 = await createAuth0Client({
        domain: config.domain,
        client_id: config.clientId
    });
}

const toggleAuthButtons = async (isAuthenticated) => {
    document.getElementById("btn-logout").disabled = !isAuthenticated;
    document.getElementById("btn-login").disabled = isAuthenticated;
}

const showContent = async (isAuthenticated) => {
    if (isAuthenticated) {
        document.getElementById("gated-content").classList.remove("hidden");
        document.getElementById("ipt-access-token").innerHTML = await auth0.getTokenSilently();
        document.getElementById("ipt-user-profile").textContent = JSON.stringify(await auth0.getUser());
    } else {
        document.getElementById("gated-content").classList.add("hidden");
    }
}

const updateUI = async () => {
    const isAuthenticated = await auth0.isAuthenticated();
    toggleAuthButtons(isAuthenticated);
    showContent(isAuthenticated);
}

const login = async () => {
    await auth0.loginWithRedirect({
        redirect_uri: window.location.origin
    });
}

const logout = () => {
    auth0.logout({
        returnTo: window.location.origin
    });
}

const processLoginState = async () => {
    const query = window.location.search;
    if (query.includes("code=") && query.includes("state=")) {
        await auth0.handleRedirectCallback();
        updateUI();
        window.history.replaceState({}, document.title, "/");
    }
}

window.onload = async () => {
    await configureClient();
    updateUI();
    if (await auth0.isAuthenticated()) {
        return; // show the gated content
    }
    await processLoginState();
}
