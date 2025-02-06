$(function () {
    users = [];
    selecting_user = null;

    const spinner = $("<div>", {
        class: "spinner absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
    }).append(
        $("<div>", {
            class: "animate-spin h-10 w-10 border-4 border-blue-500/10 rounded-full border-t-blue-500",
        })
    );

    function addUserbox(user) {
        userbox = $("<button>", {
            class: "userbox p-3 bg-sky-900 rounded-md aria-selected:bg-sky-600",
            id: `userbox-${user.user_id}`,
            item_id: user.user_id,
            text: `ID: ${user.user_id || "?"}, ${user.user_name}`,
        });
        userbox.on("click", function () {
            $(".userbox").each(function () {
                $(this).attr("aria-selected", "false");
            });
            $(this).attr("aria-selected", "true");
            selecting_user = user;
            updateUserDetails(selecting_user);
        });
        $(".user-list").append(userbox);
    }

    function updateUserDetails(user) {
        if (user.user_id == null) {
            $(".detail-user-id").attr("disabled", false);
        } else {
            $(".detail-user-id").attr("disabled", true);
        }
        $(".user-detail").attr("disabled", false);
        $(".detail-user-id").val(user.user_id);
        $(".detail-user-id").attr("placeholder", user.user_id || "IDを入力");
        $(".detail-user-name").val(user.user_name);
        $(".detail-user-name").attr(
            "placeholder",
            user.user_name || "名前を入力"
        );
    }

    GetUsers(
        (users) => {
            this.users = users;
            for (let i = 0; i < users.length; i++) {
                addUserbox(users[i]);
            }
            $(".user-list > .spinner").remove();
        },
        (error) => {
            console.error(error);
        }
    );
    $("#hack").remove();
    $("#addUser").on("click", function () {
        selecting_user = new User({ user_id: null, user_name: "" });
        updateUserDetails(selecting_user);
    });
    $(".delete-user").on("click", function () {
        if (!selecting_user) {
            return;
        }
        if (selecting_user.user_id == null) {
            selecting_user = null;
            $(".user-detail").attr("disabled", true);
            return;
        }
        DeleteUser(
            selecting_user.user_id,
            (data) => {
                users = users.filter((i) => i.id != selecting_user.user_id);
                $(`#userbox-${selecting_user.user_id}`).remove();
                selecting_user = null;
                $(".user-detail").attr("disabled", true);
            },
            (error) => {
                console.error(error);
            }
        );
    });
    $(".update-user").on("click", function () {
        if (!selecting_user) {
            return;
        }
        if (selecting_user.user_id == null) {
            selecting_user.user_id = $(".detail-user-id").val();
            selecting_user.user_name = $(".detail-user-name").val();
            if (
                selecting_user.user_name == "" ||
                selecting_user.user_id == null
            ) {
                return;
            }
            AddUser(
                selecting_user.user_id,
                selecting_user.user_name,
                (data) => {
                    selecting_user.user_id = data.user_id;
                    $(".user-detail").attr("disabled", true);
                    users.push(selecting_user);
                    addUserbox(selecting_user);
                },
                (error) => {
                    console.error(error);
                }
            );
            return;
        }
        selecting_user.user_name = $(".detail-user-name").val();
        if (selecting_user.user_name == "" || selecting_user.user_id == null) {
            return;
        }
        UpdateUser(
            selecting_user.user_id,
            selecting_user.user_name,
            (data) => {
                $(`#userbox-${selecting_user.user_id}`).text(
                    `ID: ${selecting_user.user_id || "?"}, ${
                        selecting_user.user_name
                    }`
                );
            },
            (error) => {
                console.error(error);
            }
        );
    });
    $(".user-list").append(spinner);
});
