class Item {
    constructor(id, name, total, available) {
        this.id = id;
        this.name = name;
        this.total = total;
        this.available = available;
    }
}

function getItemById(
    id,
    onSuccessCallback = (item) => {},
    onNotFoundCallback = () => {},
    onErrorCallback = (error) => {}
) {
    $.ajax({
        url: "/api/item",
        type: "GET",
        data: { id: id },
    }).then(
        (data) => {
            if (data.length == 0) {
                onNotFoundCallback();
                return;
            }
            ret = data[0];
            item = new Item(
                        ret.item_id,
                        ret.item_name,
                        ret.item_total_amount,
                        ret.item_left_amount
                    );
            onSuccessCallback(item);
        },
        (error) => {
            onErrorCallback(error);
        }
    );
}
