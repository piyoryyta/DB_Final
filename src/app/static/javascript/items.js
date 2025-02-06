$(function () {
    items = [];
    current_item = null;

    const spinner = $("<div>", {
        class: "spinner absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
    }).append(
        $("<div>", {
            class: "animate-spin h-10 w-10 border-4 border-blue-500/10 rounded-full border-t-blue-500",
        })
    );

    function addItembox(item) {
        itembox = $("<button>", {
            class: "itembox p-3 bg-sky-900 rounded-md aria-selected:bg-sky-600",
            id: `itembox-${item.id}`,
            item_id: item.id,
            text: `ID: ${item.id || "?"}, ${item.name}`,
        });
        itembox.on("click", function () {
            $(".itembox").each(function () {
                $(this).attr("aria-selected", "false");
            });
            $(this).attr("aria-selected", "true");
            current_item = item;
            updateItemDetails(current_item);
        });
        $(".item-list").append(itembox);
    }

    function updateItemDetails(item) {
        $(".item-detail").attr("disabled", false);
        $(".history").removeAttr("open");
        $(".history").removeAttr("disabled");
        $(".detail-item-id").text(item.id);
        $(".detail-item-name").val(item.name);
        $(".detail-item-name").attr("placeholder", item.name);
        $(".detail-item-amount").text(`${item.available}/${item.total}`);
    }

    getItems(
        (items) => {
            this.items = items;
            for (let i = 0; i < items.length; i++) {
                addItembox(items[i]);
            }
            $(".item-list > .spinner").remove();
        },
        (error) => {
            console.error(error);
        }
    );
    $("#hack").remove();
    $("#addItem").on("click", function () {
        item = new Item(0, "", 0, 0);
        AddItem(
            item.name,
            item.total,
            item.available,
            (data) => {
                item.id = data.item_id;
                items.push(item);
                addItembox(item);
            },
            (error) => {
                console.error(error);
            }
        );
    });
    $(".delete-item").on("click", function () {
        if (!current_item) {
            return;
        }
        DeleteItem(
            current_item.id,
            (data) => {
                items = items.filter((i) => i.id != current_item.id);
                $(`#itembox-${current_item.id}`).remove();
                current_item = null;
                $(".item-detail").attr("disabled", true);
                $(".history").attr("disabled", true);
            },
            (error) => {
                console.error(error);
            }
        );
    });
    $(".update-item").on("click", function () {
        if (!current_item) {
            return;
        }
        current_item.name = $(".detail-item-name").val();
        console.log(current_item);
        UpdateItem(
            current_item.id,
            current_item.name,
            current_item.total,
            current_item.available,
            (data) => {
                $(`#itembox-${current_item.id}`).text(
                    `ID: ${current_item.id || "?"}, ${current_item.name}`
                );
            },
            (error) => {
                console.error(error);
            }
        );
    });
    $(".item-list").append(spinner);
    $(".history").on("toggle", function (event) {
        event.preventDefault();
        if (!$(this).attr("open")) {
            $(this).removeAttr("open");
            return;
        } else {
            $(".history-table > tr").each(function () {
                $(this).remove();
            });
            GetItemHistory(current_item.id, (data) => {
                data.sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                for (let i = 0; i < data.length; i++) {
                    console.log(data[i].item_amount);
                    let tr = $("<tr>").append(
                        "<td>" + new Date(data[i].created_at).toLocaleDateString() + "</td>",
                        "<td>" + data[i].user_id + "</td>",
                        "<td>" + data[i].user_name + "</td>",
                        "<td>" + (data[i].item_amount > 0 ? "貸出" : "返却") + "</td>",
                        "<td>" + Math.abs(data[i].item_amount) + "</td>",
                    )
                    if (data[i].item_amount > 0) {
                        tr.addClass("text-red-500");
                    }
                    $(".history-table").append(tr);
                }
            });
            $(this).parent().attr("open");
        }
    });
});
