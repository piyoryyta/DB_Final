$(function () {
    const items = [];
    class Item {
        constructor(id, name, total, available) {
            this.id = id;
            this.name = name;
            this.total = total;
            this.available = available;
        }
    }

    const spinner = $("<div>", {
        class: "spinner absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2",
    }).append(
        $("<div>", {
            class: "animate-spin h-10 w-10 border-4 border-blue-500/10 rounded-full border-t-blue-500",
        })
    );
    function addItembox(id) {
        item = new Item(id, "読み込み中", 0, 0);
        items.push(item);
        const index = items.length - 1;
        const itembox = createItemBox(index, item);
        const _spinner = spinner.clone();
        itembox.append(_spinner);
        itembox.insertBefore(".add-itembox");
        $.ajax({
            url: "/api/item",
            type: "GET",
            data: { id: item.id },
        }).then(
            (data) => {
                if (data.length == 0) {
                    showError("在庫IDが見つかりませんでした。");
                    removeItembox(index);
                    return;
                }
                data = data[0];
                item = new Item(
                    item.id,
                    data.item_name,
                    data.item_total_amount,
                    data.item_left_amount
                );
                onItemboxLoad(index, item);
            },
            (error) => {
                console.error(error);
                showError("在庫情報の取得に失敗しました。");
            }
        );
    }

    function createItemBox(index, item) {
        return $("<div>", {
            class: "itembox relative py-2 px-8 h-0.7 bg-stone-200 rounded-xl shadow-lg flex flex-col items-center",
            id: `itembox-${index}`,
        }).append(
            $("<div>", {
                class: "max-w-60",
            }).append(
                $("<p>", {
                    class: "text-3xl font-bold m-1",
                    id: `item-${index}-name`,
                    text: item.name,
                }),
                $("<p>", {
                    class: "text-sm",
                    id: `item-${index}-code`,
                    text: "在庫コード:" + item.id.toString().padStart(4, "0"),
                }),
                $("<p>", {
                    class: "text-sm",
                    id: `item-${index}-stock`,
                    text: "在庫残り:" + item.available + "/" + item.total,
                })
            ),
            $("<div>", {
                class: "p-2 flex justify-center items-center text-2xl",
            }).append(
                $("<button>", {
                    class: "bg-white rounded-full w-8 h-8 mx-1 hover:bg-stone-100 duration-100 border-t-gray-600 active:border-t-2",
                    id: `item-${index}-decrease`,
                    text: "-",
                }).click(() => {
                    $(`#item-${index}-quantity`).val(
                        Math.max(
                            $(`#item-${index}-quantity`).val() - 1,
                            $(`#item-${index}-quantity`).attr("min")
                        )
                    );
                }),
                $("<input>", {
                    class: "item-quantity bg-white w-16 p-2 mx-1 rounded-xs text-center",
                    id: `item-${index}-quantity`,
                    value: 0,
                    type: "number",
                    max: item.available,
                    min: item.available - item.total,
                }).on("change", function () {
                    if (!$(this).val() || $(this).val() == NaN) {
                        $(this).val(0);
                    }
                    if (parseInt($(this).val()) > parseInt($(this).attr("max"))) {
                        $(this).val($(this).attr("max"));
                    }
                    if (parseInt($(this).val()) < parseInt($(this).attr("min"))) {
                        $(this).val($(this).attr("min"));
                    }
                }
                ),
                $("<button>", {
                    class: "bg-white rounded-full w-8 h-8 mx-1 hover:bg-stone-100 duration-100 border-t-gray-600 active:border-t-2",
                    id: `item-${index}-increase`,
                    text: "+",
                }).click(() => {
                    $(`#item-${index}-quantity`).val(
                        Math.min(
                            parseInt($(`#item-${index}-quantity`).val()) + 1,
                            $(`#item-${index}-quantity`).attr("max")
                        )
                    );
                })
            ),
            $("<button>", {
                class: "bg-stone-800 text-white rounded-xl w-32 h-8 m-2 hover:bg-stone-700 duration-200 active:bg-stone-500",
                id: `item-${index}-revert`,
                text: "取消",
            }).on("click", () => {
                removeItembox(index);
            })
        );
    }

    function updateItembox(no, item) {
        items[no] = item;
        $(`#item-${no}-name`).text(item.name);
        $(`#item-${no}-code`).text(
            `在庫コード:${item.id.toString().padStart(4, "0")}`
        );
        $(`#item-${no}-stock`).text(`在庫残り:${item.available}/${item.total}`);
        $(`#item-${no}-quantity`).attr("max", item.available);
        $(`#item-${no}-quantity`).attr("min", item.available - item.total);
    }

    function removeItembox(no) {
        $(`#itembox-${no}`).remove();
        items.splice(no, 1);
    }

    function onItemboxLoad(no, item) {
        const itemSpinner = $(`#itembox-${no} .spinner`);
        itemSpinner?.remove();
        items[no] = item;
        updateItembox(no, item);
    }

    function showError(message) {
        window.alert(message);
    }

    function sendRequest() {
        const data = items.map((item, index) => {
            return {
                id: item.id,
                quantity: parseInt($(`#item-${index}-quantity`).val()),
            };
        });
        $.ajax({
            url: "/api/return",
            type: "POST",
            data: { items: data },
        }).then(
            (data) => {
                if (data.success) {
                    window.location.href = "/return";
                } else {
                    showError(data.message);
                }
            },
            (error) => {
                console.error(error);
                showError("リクエストの送信に失敗しました。");
            }
        );
    }

    $(".addItemById").submit(function (event) {
        event.preventDefault();
        const id = $(this).find(".itemCode").val();
        if (items.some((item) => item.id == id)) {
            showError("すでに読み込まれている在庫です。");
            return;
        }
        addItembox(id);
    }
    );
});
