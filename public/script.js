document.addEventListener("DOMContentLoaded", function () {
    // Get elements
    const navLinks = document.querySelectorAll(".nav-link");
    const loginBtn = document.getElementById("login-btn");
    const loginModal = document.getElementById("login-modal");
    const profileModal = document.getElementById("profile-modal");
    const bookingModal = document.getElementById("booking-modal");
    const paymentModal = document.getElementById("payment-modal");
    const successModal = document.getElementById("success-modal");
    const closeBtns = document.querySelectorAll(".close");
    const successCloseBtn = document.getElementById("success-close");
    const loginForm = document.getElementById("login-form");
    const bookingForm = document.getElementById("booking-form");
    const paymentForm = document.getElementById("payment-form");
    const contactForm = document.getElementById("contact-form");
    const bookButtons = document.querySelectorAll(".btn-book");
    const serviceBookButtons = document.querySelectorAll(".service-book-btn");
    const hamburger = document.querySelector(".hamburger");
    const navbar = document.querySelector(".navbar");
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");
    const logoutBtn = document.getElementById("logout-btn");
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    const paymentDetails = document.querySelectorAll(".payment-details-content");
    const developerModal = document.getElementById("developerModal");
    const modalAvatar = document.getElementById("modalAvatar");
    const modalName = document.getElementById("modalName");
    const modalRole = document.getElementById("modalRole");
    const modalBio = document.getElementById("modalBio");
    const modalDetailLink = document.getElementById("modalDetailLink");
    const closeModalBtn = document.querySelector(".close-modal");

    // Sistem manajemen modal yang sederhana
    function openModal(modalId) {
        // Tutup semua modal terlebih dahulu
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });

        // Buka modal yang dipilih
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    function closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Data developer
    const developers = {
        1: {
            name: "Ray'za Rahmadani Putri",
            role: "UI/UX Designer",
            bio: "Spesialis dalam desain antarmuka pengguna dengan pengalaman 5 tahun di industri transportasi digital.",
            PortofolioLink: "https://github.com/rayzarahmadani12-source/myportofolio_digital.git",
        },
        2: {
            name: "Novivka Indah Wulandari",
            role: "Frontend Developer",
            bio: "Ahli dalam pengembangan frontend dengan teknologi modern seperti React dan Vue.js.",
            PortofolioLink: "https://github.com/novivkaindah/novivkaportofolio.git",
        },
        3: {
            name: "Sovia Oktaviantika",
            role: "Backend Developer",
            bio: "Sovia bisa tidur 500abad tanpa bangund",
            PortofolioLink: "https://github.com/soviaokta/soviportoo.git",
        },
        4: {
            name: "Queensha Alya Risty",
            role: "Mobile Developer",
            bio: "Spesialis dalam pengembangan aplikasi mobile untuk platform iOS dan Android.",
            PortofolioLink: "https://github.com/qalyaristy-qra/QueenshaAlyaRisty.Portofolio",
        },
        5: {
            name: "Revina Ardiana Putri",
            role: "Data Analyst",
            bio: "Analis data dengan fokus pada optimasi rute transportasi dan pengalaman pengguna.",
            PortofolioLink: "https://github.com/cerryblossomrevina-commits/revinaa-portofolio.git",
        },
        6: {
            name: "Mochammad Fachry Maulana Abdillah",
            role: "Project Manager",
            bio: "Manajer proyek dengan pengalaman dalam mengkoordinasikan tim pengembangan produk digital.",
            PortofolioLink: "https://github.com/fachry09-cloud/FACHRY-PORTOFOLIO.git",
        },
        7: {
            name: "Taufiqorrohman",
            role: "Cyber Security & Full Stack Developer",
            bio: "Ahli dalam mengamankan infrastruktur web dan merancang aplikasi secara menyeluruh (Full Stack) mulai dari antarmuka hingga pengelolaan server.",
            PortofolioLink: "https://github.com/taufiqorrohman29",
        },
    };

    // Add click event to all developer avatars
    document.querySelectorAll(".developer-avatar").forEach((avatar) => {
        avatar.addEventListener("click", function () {
            const developerId = this.getAttribute("data-developer");
            const developer = developers[developerId];

            // Update modal content dengan data developer
            modalAvatar.src = this.querySelector("img").src;
            modalName.textContent = developer.name;
            modalRole.textContent = developer.role;
            modalBio.textContent = developer.bio;
            modalDetailLink.href = developer.PortofolioLink;

            // Tambahkan atribut untuk tracking
            modalDetailLink.setAttribute("data-developer-id", developerId);

            // Show modal dengan animasi
            openModal('developerModal');

            // Scroll ke atas jika di mobile
            if (window.innerWidth <= 768) {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    });

    // Close modal saat tombol close diklik
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", function () {
            closeAllModals();
        });
    }

    // Close modal saat area di luar modal diklik
    window.addEventListener("click", function (event) {
        if (event.target.classList.contains('modal')) {
            closeAllModals();
        }
    });

    // Close modal saat tombol ESC ditekan
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeAllModals();
        }
    });

    // Track klik pada link detail 
    modalDetailLink.addEventListener("click", function (e) {
        const developerId = this.getAttribute("data-developer-id");
        const developer = developers[developerId];

        // Log untuk analytics (opsional)
        console.log(`User clicked detail link for ${developer.name}`);

        // Buka di tab baru
        e.target.setAttribute("target", "_blank");
        e.target.setAttribute("rel", "noopener noreferrer");
    });

    // Check if user is logged in
    let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    let username = localStorage.getItem("username") || "";
    let bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    // Fungsi untuk memperbarui tampilan tombol login
    function updateLoginButton() {
        if (isLoggedIn) {
            loginBtn.innerHTML = '<i class="fas fa-user"></i>';
        } else {
            loginBtn.innerHTML = "Login";
        }
    }

    // Fungsi untuk melakukan proses logout
    function performLogout() {
        localStorage.setItem("isLoggedIn", "false");
        localStorage.removeItem("username");
        isLoggedIn = false;
        username = "";
        updateLoginButton();
        closeAllModals();

        // Tutup dropdown
        const dropdown = document.querySelector(".profile-dropdown");
        if (dropdown) {
            dropdown.classList.remove("active");
        }

        showNotification("Anda telah keluar dari akun");
    }

    // Fungsi untuk menampilkan notifikasi
    function showNotification(message) {
        const notification = document.createElement("div");
        notification.className = "notification";
        notification.textContent = message;
        notification.style.position = "fixed";
        notification.style.top = "100px";
        notification.style.right = "20px";
        notification.style.backgroundColor = "var(--maroon-color)";
        notification.style.color = "white";
        notification.style.padding = "15px 20px";
        notification.style.borderRadius = "5px";
        notification.style.boxShadow = "0 5px 15px rgba(0, 0, 0, 0.2)";
        notification.style.zIndex = "3000";
        notification.style.transform = "translateX(120%)";
        notification.style.transition = "transform 0.3s ease";
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.transform = "translateX(0)";
        }, 100);
        setTimeout(() => {
            notification.style.transform = "translateX(120%)";
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Fungsi untuk update daftar booking di modal profil
    function updateBookingList() {
        const bookingList = document.getElementById("booking-list");
        if (bookings.length === 0) {
            bookingList.innerHTML = '<p class="no-booking">Belum ada pemesanan</p>';
        } else {
            bookingList.innerHTML = "";
            bookings.forEach((booking) => {
                const bookingItem = document.createElement("div");
                bookingItem.className = "booking-item";
                bookingItem.innerHTML = `
                            <div><strong>${booking.type}</strong>: ${booking.detail}</div>
                            <div>Tanggal: ${booking.date}, Waktu: ${booking.time}</div>
                            <div>Harga: ${booking.price}, Status: ${booking.status}</div>
                        `;
                bookingList.appendChild(bookingItem);
            });
        }
    }

    // Fungsi untuk animasi perpindahan tab
    function activateTab(tabId) {
        const currentActiveTab = document.querySelector(".tab-content.active");
        const newActiveTab = document.getElementById(tabId);
        if (currentActiveTab === newActiveTab) return;

        tabBtns.forEach((btn) => btn.classList.remove("active"));
        document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");

        const currentTabId = currentActiveTab.id;
        const tabOrder = ["intercity", "rental", "tourism"];
        const currentIndex = tabOrder.indexOf(currentTabId);
        const newIndex = tabOrder.indexOf(tabId);

        if (newIndex > currentIndex) {
            currentActiveTab.classList.add("slide-out-left");
            currentActiveTab.classList.remove("active");
            newActiveTab.style.transform = "translateX(100%)";
            newActiveTab.classList.add("active");
            newActiveTab.offsetHeight; // Force reflow
            setTimeout(() => {
                newActiveTab.style.transform = "translateX(0)";
                currentActiveTab.classList.remove("slide-out-left");
            }, 10);
        } else {
            currentActiveTab.style.transform = "translateX(-100%)";
            currentActiveTab.classList.remove("active");
            newActiveTab.style.transform = "translateX(-100%)";
            newActiveTab.classList.add("active");
            newActiveTab.offsetHeight; // Force reflow
            setTimeout(() => {
                newActiveTab.style.transform = "translateX(0)";
            }, 10);
        }
    }

    // Inisialisasi awal
    if (loginBtn) updateLoginButton();

    // Toggle password visibility
    const togglePassword = document.getElementById("togglePassword");
    const passwordInput = document.getElementById("password");
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener("click", function () {
            const type =
                passwordInput.getAttribute("type") === "password" ? "text" : "password";
            passwordInput.setAttribute("type", type);
            this.classList.toggle("fa-eye");
            this.classList.toggle("fa-eye-slash");
        });
    }

    // Login Sosial
    const socialButtons = document.querySelectorAll(".social-btn");
    socialButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const provider = this.classList[1].replace("-btn", "");
            showNotification(`Anda akan diarahkan untuk login dengan ${provider}.`);
            setTimeout(() => {
                username = `${provider}_user`;
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("username", username);
                isLoggedIn = true;
                updateLoginButton();
                closeAllModals();
                showNotification(`Login dengan ${provider} berhasil! Selamat datang.`);
            }, 1000);
        });
    });

    // Smooth scrolling (only for # anchor links)
    navLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            const targetHref = this.getAttribute("href");
            if (targetHref && targetHref.startsWith("#")) {
                e.preventDefault();
                const targetSection = document.querySelector(targetHref);
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80;
                    window.scrollTo({ top: offsetTop, behavior: "smooth" });
                }
            }
        });
    });

    // Service cards click
    serviceBookButtons.forEach((btn) => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            const serviceCard = this.closest(".service-card");
            const service = serviceCard.getAttribute("data-service");
            const targetSection = document.getElementById("booking");

            if (targetSection) {
                // If on homepage where #booking exists, scroll to it
                const offsetTop = targetSection.offsetTop - 80;
                window.scrollTo({ top: offsetTop, behavior: "smooth" });
                if (service) {
                    setTimeout(() => {
                        activateTab(service);
                    }, 500);
                }
            } else {
                // If on /layanan, redirect to /booking
                window.location.href = "/booking";
            }
        });
    });

    // Tab buttons
    tabBtns.forEach((btn) => {
        btn.addEventListener("click", function () {
            const tabId = this.getAttribute("data-tab");
            activateTab(tabId);
        });
    });

    // Payment method change
    paymentMethods.forEach((method) => {
        method.addEventListener("change", function () {
            paymentDetails.forEach((detail) => {
                detail.style.display = "none";
            });
            const selectedMethod = this.value;
            document.getElementById(`${selectedMethod}-details`).style.display =
                "block";
        });
    });

    // Login button, profile, and logout legacy modal listeners have been removed securely.
    // They are now correctly handled directly by HTML href routing to our /auth and /api/auth/logout.

    // Close modals
    closeBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            closeAllModals();
        });
    });
    if (successCloseBtn) {
        successCloseBtn.addEventListener("click", () => {
            closeAllModals();
        });
    }

    // Removed obsolete loginForm local storage logic

    // Book buttons click
    bookButtons.forEach((btn) => {
        btn.addEventListener("click", function () {
            // Check true session state by checking for the dropdown profile link (only rendered if req.session.user exists)
            const trueIsLoggedIn = document.getElementById('dropdown-profile-link') !== null;

            if (!trueIsLoggedIn) {
                showNotification(
                    "Anda harus login terlebih dahulu untuk melakukan pemesanan"
                );
                setTimeout(() => {
                    window.location.href = '/auth';
                }, 1000);
                return;
            }
            let bookingType = "",
                bookingDetail = "",
                bookingPrice = "";
            if (this.hasAttribute("data-route")) {
                bookingType = "Transportasi Antar Kota";
                bookingDetail = this.getAttribute("data-route");
                bookingPrice = this.getAttribute("data-price");
            } else if (this.hasAttribute("data-vehicle")) {
                bookingType = "Sewa Kendaraan";
                bookingDetail = this.getAttribute("data-vehicle");
                bookingPrice = this.getAttribute("data-price");
            } else if (this.hasAttribute("data-package")) {
                bookingType = "Paket Wisata";
                bookingDetail = this.getAttribute("data-package");
                bookingPrice = this.getAttribute("data-price");
            }
            const formattedPrice = new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
            }).format(parseInt(bookingPrice));
            document.getElementById("booking-type").value = bookingType;
            document.getElementById("booking-detail").value = bookingDetail;
            document.getElementById("booking-price").value = formattedPrice;
            openModal('booking-modal');
        });
    });

    // Booking form submit
    if (bookingForm) {
        bookingForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const bookingType = document.getElementById("booking-type").value;
            const bookingDetail = document.getElementById("booking-detail").value;
            const bookingPrice = document.getElementById("booking-price").value;
            const bookingDate = document.getElementById("booking-date").value;
            const bookingTime = document.getElementById("booking-time").value;
            const bookingPassengers =
                document.getElementById("booking-passengers").value;
            if (bookingType && bookingDetail && bookingDate && bookingTime) {
                document.getElementById("payment-type").textContent = bookingType;
                document.getElementById("payment-detail").textContent = bookingDetail;
                document.getElementById("payment-date").textContent = bookingDate;
                document.getElementById("payment-time").textContent = bookingTime;
                document.getElementById("payment-passengers").textContent =
                    bookingPassengers;
                document.getElementById("payment-total").textContent = bookingPrice;
                closeAllModals();
                openModal('payment-modal');
            }
        });
    }

    // Payment form submit - VERSI YANG SUDAH DIPERBAIKI
    if (paymentForm) {
        paymentForm.addEventListener("submit", function (e) {
            e.preventDefault();

            // Validasi apakah metode pembayaran sudah dipilih
            const paymentMethodInput = document.querySelector('input[name="payment-method"]:checked');
            if (!paymentMethodInput) {
                showNotification("Silakan pilih metode pembayaran terlebih dahulu.");
                return;
            }
            const paymentMethod = paymentMethodInput.value;

            // Validasi detail metode pembayaran
            if (paymentMethod === "transfer") {
                const accountName = document.getElementById("account-name");
                if (!accountName || !accountName.value.trim()) {
                    showNotification("Silakan masukkan nama pengirim untuk transfer bank.");
                    if (accountName) accountName.focus();
                    return;
                }
            } else if (paymentMethod === "ewallet") {
                const ewalletNumber = document.getElementById("ewallet-number");
                if (!ewalletNumber || !ewalletNumber.value.trim()) {
                    showNotification("Silakan masukkan nomor telepon untuk E-Wallet.");
                    if (ewalletNumber) ewalletNumber.focus();
                    return;
                }
            } else if (paymentMethod === "cc") {
                const ccNumber = document.getElementById("cc-number");
                const ccExpiry = document.getElementById("cc-expiry");
                const ccCvv = document.getElementById("cc-cvv");
                const ccName = document.getElementById("cc-name");
                if (!ccNumber.value.trim() || !ccExpiry.value.trim() || !ccCvv.value.trim() || !ccName.value.trim()) {
                    showNotification("Silakan lengkapi semua detail kartu kredit.");
                    if (ccName) ccName.focus();
                    return;
                }
            }

            // Jika semua validasi lolos, lanjutkan proses
            const booking = {
                id: Date.now(),
                type: document.getElementById("payment-type").textContent,
                detail: document.getElementById("payment-detail").textContent,
                price: document.getElementById("payment-total").textContent,
                date: document.getElementById("payment-date").textContent,
                time: document.getElementById("payment-time").textContent,
                passengers: document.getElementById("payment-passengers").textContent,
                paymentMethod: paymentMethod,
                status: "Dibayar",
            };
            bookings.push(booking);
            localStorage.setItem("bookings", JSON.stringify(bookings));

            // Tampilkan modal sukses dan reset form
            closeAllModals();
            openModal('success-modal');
            paymentForm.reset();

            // Kembalikan pilihan metode pembayaran ke default
            var transferCheckbox = document.getElementById("transfer");
            if (transferCheckbox) transferCheckbox.checked = true;
            paymentDetails.forEach((detail) => {
                detail.style.display = "none";
            });
            var transferDetails = document.getElementById("transfer-details");
            if (transferDetails) transferDetails.style.display = "block";
        });
    }

    // Removed legacy Contact form submit javascript intercept

    // Scroll animations
    const animateOnScroll = function () {
        const elements = document.querySelectorAll(
            ".service-card, .destination-card, .booking-card, .rental-card, .tourism-card"
        );
        elements.forEach((element) => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            if (elementPosition < windowHeight - 100) {
                element.style.opacity = "1";
                element.style.transform = "translateY(0)";
            }
        });
    };
    const cards = document.querySelectorAll(
        ".service-card, .destination-card, .booking-card, .rental-card, .tourism-card"
    );
    cards.forEach((card) => {
        card.style.opacity = "0";
        card.style.transform = "translateY(20px)";
        card.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    });
    window.addEventListener("scroll", animateOnScroll);
    animateOnScroll(); // Run on load
});