anonymous_allowed = ["/login", "/users"];
if (
    $.cookie("user") == null &&
    anonymous_allowed.indexOf(window.location.pathname) == -1
) {
    window.location.href = "/login";
}

class User {
    constructor(json) {
        this.user_id = json.user_id;
        this.user_name = json.user_name;
    }
}
const current_user =
    $.cookie("user") == null
        ? new User({ user_id: -1, user_name: "ゲスト" })
        : new User(JSON.parse($.cookie("user")));
console.log("Logging in as "+current_user);

function Login(id) {
    $.ajax({
        url: "/api/login",
        type: "POST",
        data: { id: id },
    }).then(
        (data) => {
            $.cookie("user", JSON.stringify({ id: id, name: data.name }), 1);
            window.location.href = "/";
        },
        (error) => {
            console.error(error);
        }
    );
    $cookie("user", JSON.stringify({ id: id }), 1);
    window.location.href = "/";
}

function GetUsers(
    onSuccessCallback = (users) => {},
    onErrorCallback = (error) => {}
) {
    $.ajax({
        url: "/api/user",
        type: "GET",
    }).then(
        (data) => {
            onSuccessCallback(data);
        },
        (error) => {
            onErrorCallback(error);
        }
    );
}

function GetUser(
    id,
    onSuccessCallback = (user) => {},
    onErrorCallback = (error) => {}
) {
    $.ajax({
        url: "/api/user",
        type: "GET",
        data: { id: id },
    }).then(
        (data) => {
            onSuccessCallback(data);
        },
        (error) => {
            onErrorCallback(error);
        }
    );
}

function AddUser(
    id,
    name,
    onSuccessCallback = (user) => {},
    onErrorCallback = (error) => {}
) {
    $.ajax({
        url: "/api/user",
        type: "POST",
        data: {
            data: JSON.stringify({
                id: id,
                name: name,
            }),
        },
    }).then(
        (data) => {
            onSuccessCallback(data);
        },
        (error) => {
            onErrorCallback(error);
        }
    );
}

function UpdateUser(
    id,
    name,
    onSuccessCallback = (user) => {},
    onErrorCallback = (error) => {}
) {
    $.ajax({
        url: "/api/user",
        type: "PUT",
        data: JSON.stringify({ id: id, name: name }),
        contentType: "application/json",
    }).then(
        (data) => {
            onSuccessCallback(data);
        },
        (error) => {
            onErrorCallback(error);
        }
    );
}

function DeleteUser(
    id,
    onSuccessCallback = (user) => {},
    onErrorCallback = (error) => {}
) {
    $.ajax({
        url: "/api/user",
        type: "DELETE",
        data: { id: id },
    }).then(
        (data) => {
            onSuccessCallback(data);
        },
        (error) => {
            onErrorCallback(error);
        }
    );
}
