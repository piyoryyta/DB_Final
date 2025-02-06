class Item {
    constructor(id, name, total, available) {
        this.id = id;
        this.name = name;
        this.total = total;
        this.available = available;
    }
}

function UpdateItem(
    id,
    name,
    total,
    available,
    onSuccessCallback = (data) => {},
    onErrorCallback = (error) => {}
) {
    $.ajax({
        url: "/api/item",
        type: "PUT",
        data: {
            id: id,
            name: name,
            total: total,
            available: available,
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

function AddItem(
    name,
    total,
    available,
    onSuccessCallback = (data) => {},
    onErrorCallback = (error) => {}
) {
    $.ajax({
        url: "/api/item",
        type: "PUT",
        data: {
            name: name,
            total: total,
            available: available,
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

function DeleteItem(
    id,
    onSuccessCallback = (data) => {},
    onErrorCallback = (error) => {}
) {
    $.ajax({
        url: "/api/item",
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

function getItems(
    onSuccessCallback = (items) => {},
    onErrorCallback = (error) => {}
) {
    $.ajax({
        url: "/api/item",
        type: "GET",
    }).then(
        (data) => {
            items = [];
            for (let i = 0; i < data.length; i++) {
                ret = data[i];
                item = new Item(
                    ret.item_id,
                    ret.item_name,
                    ret.item_total_amount,
                    ret.item_left_amount
                );
                items.push(item);
            }
            onSuccessCallback(items);
        },
        (error) => {
            onErrorCallback(error);
        }
    );
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

function requestUseReturn(
    user_id,
    items,
    items_amount,
    onSuccessCallback = (data) => {},
    onErrorCallback = (error) => {}
) {
    const data = items.map((item, index) => {
        return {
            item_id: item.id,
            item_amount: items_amount[index],
            item_left_amount: item.available - items_amount[index],
        };
    });
    $.ajax({
        url: "/api/use-return",
        type: "POST",
        data: {
            data: JSON.stringify(data),
            user_id: user_id,
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
