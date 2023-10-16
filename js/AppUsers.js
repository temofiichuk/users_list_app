function AppUsers() {
  this.users = () => JSON.parse(localStorage.getItem("users")) ?? [];
  this.userModalInfo = document.getElementById("user-modal_info");
  this.userModalForm = document.getElementById("user-modal_form");
  this.userForm = document.user_form;
  this.$users = document.getElementById("users-table");
  this.deleteForm = document.getElementById("popup-modal_user-delete");

  this.formElements = [
    this.userForm.first_name,
    this.userForm.last_name,
    this.userForm.position,
    this.userForm.image,
    this.userForm.phone,
    this.userForm.email
  ];

  this.liveSearch = document.getElementById("live-search");
  this.validForm = true;

  this._init = () => {
    this.updateList();
    this.submitForm();
    this.setActions();
  };

  this.setActions = () => {
    document.addEventListener("click", e => {
      // show hide modal form
      if (e.target.closest("[class^='user-modal_form-']")) {
        this.userModalForm.classList.toggle("hidden");
      }
      // close and reset modal form
      if (e.target.closest(".user-modal_form-close")) {
        this.closeModalForm();
      }
      // set data-type attr
      if (e.target.closest(".user-modal_form-button")) {
        this.userForm.setAttribute(
          "data-type",
          e.target.getAttribute("data-type")
        );
      }
      // open dropdown
      if (e.target.closest(".dropdown")) {
        e.target
          .closest(".dropdown")
          .nextElementSibling.classList.toggle("hidden");
      }
      // open the form for editing
      if (e.target.closest('button[data-type="edit"]')) {
        this.editingForm(e.target.closest('[data-type="edit"]'));
      }
      // show info about user
      if (e.target.closest(".user-modal_info-button")) {
        this.showUserInfo(e.target);
      }
      // close modal info
      if (e.target.closest(".user-modal_info-close")) {
        this.userModalInfo.classList.add("hidden");
      }
      // open delete form
      if (e.target.closest(".user-delete-button")) {
        this.deleteForm.classList.remove("hidden");
        const deleteBtn = this.deleteForm.querySelector(".user_delete-button");
        // delete user
        const id = e.target
          .closest(".user-delete-button")
          .getAttribute("data-user_id");
        deleteBtn.addEventListener("click", () => this.deleteUser(id));
      }
      // close delete form
      if (e.target.closest(".close_delete-form_button")) {
        this.deleteForm.classList.add("hidden");
      }
    });

    this.getUsersBySearch();
  };

  this.getUsersBySearch = () => {
    this.liveSearch.addEventListener("keyup", e => {
      const name = e.target.value.trim().toLowerCase();
      if (name.length > 2) {
        this.$users.innerHTML = "";
        this.users().forEach(user => {
          if (
            user.first_name.toLowerCase().startsWith(name) ||
            user.last_name.toLowerCase().startsWith(name)
          ) {
            this.$users.append(this.userTemplate(user));
          }
        });
      } else {
        this.updateList();
      }
    });
  };

  this.closeModalForm = () => {
    this.userModalForm.classList.add("hidden");
    this.userForm.reset();
    this.userForm.removeAttribute("data-type");
    this.userForm.removeAttribute("data-user_id");
  };

  this.setUser = user => {
    this.updateUsers([...this.users(), user]);
  };

  this.getUserById = id => {
    return this.users().find(user => user.id === +id);
  };

  this.deleteUser = id => {
    this.updateUsers(this.users().filter(user => user.id !== +id));
  };

  this.updateUsers = users => {
    localStorage.setItem("users", JSON.stringify(users));
    this.updateList();
  };

  this.updateList = () => {
    if (this.users().length < 1) {
      this.$users.innerHTML = "<tr><td class='px-6 py-4'>No users</td></tr>";
      this.liveSearch.setAttribute("disabled", "");
      return;
    }
    this.liveSearch.removeAttribute("disabled");
    this.$users.innerHTML = "";
    this.users().forEach(user => this.$users.append(this.userTemplate(user)));
  };

  this.submitForm = () => {
    this.userForm.addEventListener("submit", e => {
      e.preventDefault();
      if (!this.validateForm()) return;

      if (e.target.getAttribute("data-type") === "add") {
        this.createUser();
      }

      if (e.target.getAttribute("data-type") === "edit") {
        this.updateUser();
      }
    });
  };

  this.showUserInfo = btn => {
    const id = +btn.getAttribute("data-user_id");
    const user = this.getUserById(id);

    this.userModalInfo.querySelector(".user_image").src = user.image;
    this.userModalInfo.querySelector(
      ".user_full-name"
    ).textContent = `${user.first_name} ${user.last_name} `;
    this.userModalInfo.querySelector(".user_email").textContent = user.email;
    this.userModalInfo.querySelector(".user_phone").textContent = user.phone;
    this.userModalInfo.querySelector(".user_position").textContent =
      user.position;

    this.userModalInfo.classList.remove("hidden");
  };

  this.validateForm = () => {
    this.validForm = true;

    this.formElements.forEach(input => {
      input.classList.remove("error");

      if (
        input.name === "first_name" ||
        input.name === "last_name" ||
        input.name === "position"
      ) {
        this.checkPascalCase(input);
        this.checkSymbols(input);
      }
      if (input.name === "email") {
        this.checkEmail(input);
      }
      if (input.name === "phone") {
        this.checkPhone(input);
      }
      if (input.name === "image") {
        this.checkUrl(input);
      }
      this.checkLength(input, 3);
      this.checkRequired(input);
    });

    return this.validForm;
  };

  this.setValidationError = (input, message) => {
    input.nextElementSibling.textContent = message;
    input.classList.add("error");
    this.validForm = false;
  };

  this.checkUrl = input => {
    const typesOfPhotos = ["jpeg", "jpg", "png", "webp", "swg"];
    const patternProtocol = /^https?:\/\//i;
    const patternType = new RegExp(`\\b(?:${typesOfPhotos.join("|")})\\b`, "i");
    const patternUrl =
      /:\/\/((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))[\w|\W]*$/i;

    if (!patternUrl.test(input.value.trim())) {
      this.setValidationError(input, `Invalid url address`);
    }
    if (!patternProtocol.test(input.value.trim())) {
      this.setValidationError(input, `Invalid url protocol`);
    }
    if (!patternType.test(input.value.trim())) {
      this.setValidationError(input, `Only such formats as ${typesOfPhotos}`);
    }
  };

  this.checkEmail = input => {
    const pattern =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!pattern.test(input.value.trim())) {
      this.setValidationError(input, `Invalid e-mail`);
    }
  };

  this.checkPhone = input => {
    const pattern = /^\+\(?380\)?\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{3}$/;
    if (!pattern.test(input.value.trim())) {
      this.setValidationError(input, `Must be like +(380) хх хх хх ххх`);
    }
  };

  this.checkLength = (input, min) => {
    if (input.value.length < min) {
      this.setValidationError(
        input,
        `There must be at least ${min} characters`
      );
    }
  };

  this.checkRequired = input => {
    if (input.value.trim() === "") {
      this.setValidationError(input, "It is required field");
    }
  };

  this.checkSymbols = input => {
    const pattern = /[\d|\W]/;
    if (pattern.test(input.value.trim())) {
      this.setValidationError(input, `There can't be numbers or symbols`);
    }
  };

  this.checkPascalCase = input => {
    const pattern = /^[A-Z|А-ЯЄІЇ]/;
    if (!pattern.test(input.value.trim())) {
      this.setValidationError(input, "Invalid Name format");
    }
  };

  this.editingForm = btn => {
    const id = +btn.getAttribute("data-user_id");
    const user = this.getUserById(id);

    this.userForm.first_name.value = user.first_name;
    this.userForm.last_name.value = user.last_name;
    this.userForm.email.value = user.email;
    this.userForm.phone.value = user.phone;
    this.userForm.position.value = user.position;
    this.userForm.image.value = user.image;

    this.userForm.setAttribute("data-user_id", id);
  };

  this.updateUser = () => {
    const id = +this.userForm.getAttribute("data-user_id");

    const users = this.users().map(user => {
      if (user.id === id) {
        user.first_name = this.userForm.first_name.value;
        user.last_name = this.userForm.last_name.value;
        user.email = this.userForm.email.value;
        user.phone = this.userForm.phone.value;
        user.position = this.userForm.position.value;
        user.image = this.userForm.image.value;
      }
      return user;
    });

    this.updateUsers(users);
    this.closeModalForm();
  };

  this.createUser = () => {
    const user = {
      id: new Date().getTime(),
      first_name: this.userForm.first_name.value,
      last_name: this.userForm.last_name.value,
      email: this.userForm.email.value,
      phone: this.userForm.phone.value,
      position: this.userForm.position.value,
      image: this.userForm.image.value
    };

    this.setUser(user);
    this.closeModalForm();
  };

  this.userTemplate = user => {
    const $user = document.createElement("tr");
    $user.className =
      "bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600";
    $user.innerHTML = `
       <th scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white" >
          <img class="w-10 h-10 object-cover rounded-full" src="${user.image}" alt="${user.first_name} ${user.last_name}" />
          <div class="pl-3">
             <div class="text-base font-semibold">${user.first_name} ${user.last_name}</div>
             <div class="font-normal text-gray-500">${user.email}</div>
          </div>
       </th>
       <td class="w-auto px-6 py-4">${user.position}</td>
       
       <td class="w-12 px-6 py-4">
          <div class="flex justify-end px-4">
              <div class="inline-flex rounded-md shadow-sm" role="group">
                  <button type="button" data-user_id="${user.id}" class="user-modal_info-button px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-900 rounded-l-lg hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                      View
                  </button>
                  <button type="button" data-type="edit" data-user_id="${user.id}" class="user-modal_form-button px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border-t border-b border-gray-900 hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                      Edit
                  </button>
                  <button type="button" data-user_id="${user.id}" class="user-delete-button px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-900 rounded-r-md hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                      Delete
                  </button>
              </div>
          </div>
       </td>`;
    return $user;
  };
}
