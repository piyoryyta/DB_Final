$(function () {
    const items = [];

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
        itembox.insertBefore("#itemListSeparator");
        getItemById(
            item.id,
            (items) => {
                onItemboxLoad(index, item);
            },
            () => {
                showError("在庫IDが見つかりませんでした。");
                removeItembox(index);
            },
            (error) => {
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
                    if (
                        parseInt($(this).val()) > parseInt($(this).attr("max"))
                    ) {
                        $(this).val($(this).attr("max"));
                    }
                    if (
                        parseInt($(this).val()) < parseInt($(this).attr("min"))
                    ) {
                        $(this).val($(this).attr("min"));
                    }
                }),
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
        if (items.length == 0) {
            showError("在庫を追加してください。");
            return;
        }
        const data = items.map((item, index) => {
            return {
                item_id: parseInt(item.id),
                item_amount: parseInt($(`#item-${index}-quantity`).val()),
                item_left_amount:
                    item.available -
                    parseInt($(`#item-${index}-quantity`).val()),
            };
        });
        user_id = "0"; // Dummy user_id
        console.log(data);
        $.ajax({
            url: "/api/use-return",
            type: "POST",
            data: { data: JSON.stringify(data), user_id: user_id },
        }).then(
            (data) => {
                if (data.success) {
                    for (let i = 0; i < items.length; i++) {
                        // For the users who dare to use the back button
                        removeItembox(i);
                    }
                    window.location.href = "/use-return/complete";
                } else {
                    showError(data.error);
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
        itemCode = $(this).find(".itemCode");
        itemCode.val(
            itemCode
                .val()
                .replace(/[０-９]/g, function (s) {
                    return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
                })
                .replace(/[^0-9]/g, "")
        );
        if (!itemCode.val()) {
            return;
        }
        const id = itemCode.val();
        if (items.some((item) => item.id == id)) {
            showError("すでに読み込まれている在庫です。");
            return;
        }
        addItembox(id);
    });

    $(".use-return").on("click", function () {
        sendRequest();
    });
});
