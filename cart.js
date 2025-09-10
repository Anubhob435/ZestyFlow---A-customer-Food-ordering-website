
    const addButtons = document.querySelectorAll('.add-btn');
    addButtons.forEach(button => {
        button.addEventListener('click', () => {
            const card = button.closest('.menucard');
            const name = card.querySelector('h3').textContent;
            const priceText = card.querySelector('p').textContent;
            const price = priceText.match(/₹(\d+)/)[1];

            const item = {
                name: name,
                price: parseInt(price),
                quantity: 1
            };

            let cart = JSON.parse(localStorage.getItem('cart')) || [];

            const index = cart.findIndex(i => i.name === item.name);
            if (index !== -1) {
                cart[index].quantity += 1;
            } else {
                cart.push(item);
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            alert(`${item.name} added to cart`);
        });
    });
