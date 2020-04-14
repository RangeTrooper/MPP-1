function GetGuitars() {
    $.ajax({
        url: "/api/guitars",
        type: "GET",
        contentType: "application/json",
        success: function (guitars) {

            var rows = "";
            $.each(guitars, function (index, guitar) {
                rows += row(guitar);
            })
            $("table tbody").append(rows);
            $('#guitarTable').DataTable();
            $('.dataTables_length').addClass('bs-select');
            render(window.location.hash);
        }
    });
}

function CreateGuitar() {
    $.ajax({
        url: "api/guitars",
        contentType: "application/json",
        method: "POST",
        data: JSON.stringify({
            model: model,
            amount: amount
        }),
        success: function (guitar) {
            reset();
            $("table tbody").append(row(guitar));
        }
    })
}

function reset() {
    var form = document.forms["userForm"];
    form.reset();
    form.elements["id"].value = 0;
}

function DeleteGuitar(id) {
    $.ajax({
        url: "api/guitars/" + id,
        contentType: "application/json",
        method: "DELETE",
        xhrFields: {
            withCredentials: true
        },
        success: function (guitar_id) {
            console.log(guitar_id);
            $("tr[data-rowid='" + guitar_id + "']").remove();
        }
    })
}

var row = function (guitar) {
    let img_src;
    if (guitar.img_src === 'NULL' || guitar.img_src == null)
        img_src = "no_image_found.png";
    else
        img_src = guitar.img_src;
    return "<tr data-rowid='" + guitar.guitar_id + "'><td><img style='max-width: 170px' class='img-thumbnail' src='" + img_src + "' ></td><td>" + guitar.guitar_id + "</td>" +
        "<td>" + guitar.guitar_name + "</td> <td>" + guitar.amount_in_stock + "</td>" +
        "<td><a class='editLink btn btn-info' data-id='" + guitar.guitar_id + "'>Изменить</a> | " +
        "<a class='removeLink btn btn-danger' data-id='" + guitar.guitar_id + "'>Удалить</a></td></tr>";
}
$("#reset").click(function (e) {

    e.preventDefault();
    reset();
})

$("body").on("click", ".editLink", function () {
    var id = $(this).data("id");
    //GetGuitar(id);
});
$("body").on("click", ".removeLink", function () {
    var id = $(this).data("id");
    DeleteGuitar(id);
});

GetGuitars();

window.onhashchange = function () {
    render(window.location.hash);
}

function render(hashKey) {
    $("#li_username").hide();
    let pages = document.querySelectorAll(".page");
    for (let i = 0; i < pages.length; ++i) {
        pages[i].style.display = 'none';
    }

    let navLis = document.querySelectorAll(".navLis");
    for (let i = 0; i < navLis.length; ++i) {
        navLis[i].classList.remove("active");
    }

    switch (hashKey) {
        case "":
            pages[0].style.display = 'block';
            document.getElementById("li_main").classList.add("active");
            break;
        case "#main":
            pages[0].style.display = 'block';
            document.getElementById("li_main").classList.add("active");
            break;
        case "#register":
            pages[1].style.display = 'block';
            document.getElementById("li_register").classList.add("active");
            break;
        case "#login":
            pages[2].style.display = 'block';
            document.getElementById("li_login").classList.add("active");
            break;
        case "#adding":
            pages[3].style.display = 'block';
            document.getElementById("li_adding").classList.add("active");
            break;
        default:
            pages[0].style.display = 'block';
            document.getElementById("li_main").classList.add("active");
    }
}


//FOR REGISTRATION FORm
function RegisterUser(login,email,password){
    $.ajax({
        url: "/api/register",
        contentType:"application/json",
        method:"POST",
        data:JSON.stringify({
            login:login,
            email:email,
            password:password
        }),
        success: function (token) {
            saveToken(token);
        }
    })
}

function logIn(login, password){
    $.ajax({
        url: "/api/login",
        contentType: "application/json",
        method: "POST",
        data: JSON.stringify({
            login: login,
            password: password
        }),
        success: function (token) {
            hideAuthButtons(login);
            window.location.hash = "#main";
        }
    })
}

$("#login_form").submit(function (e) {
    e.preventDefault();
    let login = this.elements["login_input"].value;
    let password = this.elements["password_input"].value;
    logIn(login,password);
})

$("#register_form").submit(function (e) {
    e.preventDefault();
    let login=this.elements["login_input"].value;
    let email=this.elements["email_input"].value;
    let password=this.elements["password_input"].value;
    RegisterUser(login,email,password);
})

//FOR ADDING FORM

$("#adding_form").submit(function (e) {
    e.preventDefault();
    var id = this.elements["id"].value;
    var name = this.elements["name"].value;
    var age = this.elements["age"].value;
    /*if (id == 0)
        //CreateGuitar(name, age);
    else
        EditUser(id, name, age);*/
});

function hideAuthButtons(login){
    $("#li_login").hide();
    $("#li_register").hide();
    $("#li_username").text(login).show();
}

function saveToken(token) {
    document.cook
}