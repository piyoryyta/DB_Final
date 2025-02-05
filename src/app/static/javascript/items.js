$(function () {
    items = [];

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
            text: `ID: ${item.id}, ${item.name}`,
        });
        itembox.on("click", function () {
            $(".itembox").each(function () {
                $(this).attr("aria-selected", "false");
            });
            $(this).attr("aria-selected", "true");
            updateItemDetails(item);
        });
        $(".item-list").append(itembox);
    }

    function updateItemDetails(item) {
        $(".item-detail").attr("disabled", false);
        $(".item-detail > details").removeAttr("open");
        $(".item-detail > details").removeAttr("disabled");
        $(".detail-item-id").text(item.id);
        $(".detail-item-name").val(item.name);
        $(".detail-item-name").attr("placeholder", item.name);
        $(".detail-item-amount").text(`${item.available}/${item.total}`);
    }

    function getItemHistory(id) {}

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
    $(".item-list").append(spinner);
});
