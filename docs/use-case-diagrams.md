# Salonify - Use-case dijagrami po ulozi

Ovi dijagrami prikazuju glavne funkcionalnosti aplikacije po ulozi. Use-case-ovi su izvuceni iz backend kontrolera i frontend ruta: `User`, `Salon` i `Admin`.

## Korisnik

```mermaid
flowchart LR
    user["Korisnik"]

    subgraph app["Salonify aplikacija"]
        UC_REGISTER(["Registruje nalog"])
        UC_LOGIN(["Prijavljuje se"])
        UC_PROFILE(["Azurira kontakt podatke"])
        UC_BROWSE(["Pregleda salone"])
        UC_SEARCH(["Pretrazuje i filtrira salone"])
        UC_DETAILS(["Pregleda detalje salona"])
        UC_SERVICES(["Pregleda usluge salona"])
        UC_AVAILABLE(["Pregleda dostupne termine"])
        UC_BOOK(["Zakazuje termin"])
        UC_MY_APPTS(["Pregleda svoje termine"])
        UC_CANCEL(["Otkazuje termin"])
        UC_REVIEW(["Ostavlja recenziju"])
        UC_MY_REVIEWS(["Pregleda svoje recenzije"])
        UC_RECOMMENDED(["Pregleda preporucene salone"])
        UC_TRACKING(["Generise aktivnosti za preporuke"])
    end

    user --> UC_REGISTER
    user --> UC_LOGIN
    user --> UC_PROFILE
    user --> UC_BROWSE
    user --> UC_SEARCH
    user --> UC_DETAILS
    user --> UC_SERVICES
    user --> UC_AVAILABLE
    user --> UC_BOOK
    user --> UC_MY_APPTS
    user --> UC_CANCEL
    user --> UC_REVIEW
    user --> UC_MY_REVIEWS
    user --> UC_RECOMMENDED

    UC_SEARCH --> UC_TRACKING
    UC_DETAILS --> UC_TRACKING
    UC_SERVICES --> UC_TRACKING
    UC_BOOK --> UC_TRACKING
```

Korisnik koristi javni deo aplikacije za pronalazenje salona, zakazivanje i recenzije. Njegove aktivnosti kao sto su pretraga, pregled salona, pregled usluge i rezervacija ulaze u `PreferenceVector`, koji se kasnije koristi za content-based preporuke.

## Salon

```mermaid
flowchart LR
    salon["Salon"]

    subgraph app["Salonify aplikacija"]
        UC_REGISTER(["Registruje salon nalog"])
        UC_LOGIN(["Prijavljuje se"])
        UC_DASHBOARD(["Pregleda salon dashboard"])
        UC_PROFILE(["Azurira profil salona"])
        UC_IMAGE(["Azurira naslovnu sliku"])
        UC_WORKING(["Uredjuje radne dane i radno vreme"])
        UC_SERVICES_VIEW(["Pregleda svoje usluge"])
        UC_SERVICE_ADD(["Dodaje uslugu"])
        UC_SERVICE_EDIT(["Menja uslugu"])
        UC_SERVICE_DELETE(["Brise uslugu"])
        UC_GALLERY_ADD(["Dodaje slike u galeriju"])
        UC_GALLERY_DELETE(["Brise slike iz galerije"])
        UC_APPTS_VIEW(["Pregleda termine salona"])
        UC_APPT_ACCEPT(["Prihvata termin"])
        UC_APPT_REJECT(["Odbija termin"])
        UC_APPT_COMPLETE(["Oznacava termin kao zavrsen"])
        UC_APPT_FILTER(["Filtrira termine po statusu"])
        UC_REVIEWS(["Pregleda recenzije"])
        UC_FEATURE_VECTOR(["Azurira feature vektor salona"])
    end

    salon --> UC_REGISTER
    salon --> UC_LOGIN
    salon --> UC_DASHBOARD
    salon --> UC_PROFILE
    salon --> UC_IMAGE
    salon --> UC_WORKING
    salon --> UC_SERVICES_VIEW
    salon --> UC_SERVICE_ADD
    salon --> UC_SERVICE_EDIT
    salon --> UC_SERVICE_DELETE
    salon --> UC_GALLERY_ADD
    salon --> UC_GALLERY_DELETE
    salon --> UC_APPTS_VIEW
    salon --> UC_APPT_ACCEPT
    salon --> UC_APPT_REJECT
    salon --> UC_APPT_COMPLETE
    salon --> UC_APPT_FILTER
    salon --> UC_REVIEWS

    UC_SERVICE_ADD --> UC_FEATURE_VECTOR
    UC_SERVICE_EDIT --> UC_FEATURE_VECTOR
    UC_SERVICE_DELETE --> UC_FEATURE_VECTOR
```

Salon upravlja svojim profilom, uslugama, radnim vremenom, galerijom i terminima. Kada salon doda, izmeni ili obrise uslugu, sistem ponovo racuna `FeatureVector` salona, jer se time menja sadrzaj na osnovu kog se salon poredi sa korisnickim preferencijama.

## Admin

```mermaid
flowchart LR
    admin["Admin"]

    subgraph app["Salonify aplikacija"]
        UC_LOGIN(["Prijavljuje se"])
        UC_ADMIN_PANEL(["Pristupa admin panelu"])
        UC_SALONS(["Pregleda salone"])
        UC_REVIEWS(["Pregleda recenzije"])
        UC_DELETE_REVIEW(["Brise recenziju"])
        UC_REFRESH_SALON_VECTORS(["Osvezava vektore salona"])
        UC_NORMALIZE_USER_VECTORS(["Normalizuje korisnicke vektore"])
        UC_RECOMMENDATIONS_FOR_USER(["Pregleda preporuke za korisnika"])
        UC_VIEW_USER_DATA(["Pregleda korisnicke podatke"])
        UC_VIEW_SALON_ACTIVITY(["Evidentira pregled salona/usluge"])
    end

    admin --> UC_LOGIN
    admin --> UC_ADMIN_PANEL
    admin --> UC_SALONS
    admin --> UC_REVIEWS
    admin --> UC_DELETE_REVIEW
    admin --> UC_REFRESH_SALON_VECTORS
    admin --> UC_NORMALIZE_USER_VECTORS
    admin --> UC_RECOMMENDATIONS_FOR_USER
    admin --> UC_VIEW_USER_DATA
    admin --> UC_VIEW_SALON_ACTIVITY
```

Admin ima poseban `/admin` panel. Trenutno su najvaznije admin funkcionalnosti odrzavanje sistema preporuka i moderacija recenzija: osvezavanje `FeatureVector` vrednosti za salone, normalizacija `PreferenceVector` vrednosti za korisnike i brisanje recenzija.

## Zajednicki pregled sistema

```mermaid
flowchart TB
    user["Korisnik"]
    salon["Salon"]
    admin["Admin"]

    subgraph app["Salonify"]
        AUTH(["Registracija i prijava"])
        SEARCH(["Pretraga i pregled salona"])
        BOOKING(["Zakazivanje termina"])
        REVIEWS(["Recenzije"])
        SALON_MGMT(["Upravljanje salonom"])
        APPT_MGMT(["Upravljanje terminima"])
        RECOMMENDATIONS(["Sistem preporuka"])
        ADMIN_MGMT(["Administracija sistema"])
    end

    user --> AUTH
    user --> SEARCH
    user --> BOOKING
    user --> REVIEWS
    user --> RECOMMENDATIONS

    salon --> AUTH
    salon --> SALON_MGMT
    salon --> APPT_MGMT
    salon --> REVIEWS

    admin --> AUTH
    admin --> SEARCH
    admin --> REVIEWS
    admin --> RECOMMENDATIONS
    admin --> ADMIN_MGMT
```

## Proces zakazivanja termina

Ovaj dijagram prikazuje use-case tok zakazivanja termina u aplikaciji Salonify. Primarni akter je korisnik, koji pronalazi salon, bira uslugu i salje zahtev za termin. Salon je sekundarni akter koji kasnije prihvata ili odbija zahtev.

```mermaid
flowchart LR
    user["Korisnik"]
    salon["Salon"]

    subgraph app["Salonify aplikacija"]
        UC_LOGIN(["Prijavljuje se"])
        UC_SEARCH(["Pretrazuje salone"])
        UC_DETAILS(["Pregleda detalje salona"])
        UC_SERVICES(["Pregleda dostupne usluge"])
        UC_SELECT_SERVICE(["Bira uslugu"])
        UC_TRACK_SERVICE(["Evidentira pregled usluge"])
        UC_SELECT_DATE(["Bira datum"])
        UC_AVAILABLE(["Pregleda dostupne termine"])
        UC_SELECT_TIME(["Bira vreme termina"])
        UC_NOTE(["Unosi napomenu za salon"])
        UC_CREATE(["Salje zahtev za zakazivanje"])
        UC_MY_APPTS(["Pregleda svoje rezervacije"])
        UC_SALON_APPTS(["Pregleda zahteve za termine"])
        UC_ACCEPT(["Prihvata termin"])
        UC_REJECT(["Odbija termin"])
        UC_NOTIFY(["Dobija status rezervacije"])
    end

    user --> UC_LOGIN
    user --> UC_SEARCH
    user --> UC_DETAILS
    user --> UC_SERVICES
    user --> UC_SELECT_SERVICE
    user --> UC_SELECT_DATE
    user --> UC_AVAILABLE
    user --> UC_SELECT_TIME
    user --> UC_CREATE
    user --> UC_MY_APPTS

    salon --> UC_SALON_APPTS
    salon --> UC_ACCEPT
    salon --> UC_REJECT

    UC_SELECT_SERVICE --> UC_TRACK_SERVICE
    UC_SELECT_SERVICE --> UC_AVAILABLE
    UC_SELECT_DATE --> UC_AVAILABLE
    UC_SELECT_TIME --> UC_CREATE
    UC_NOTE -. opciono .-> UC_CREATE
    UC_CREATE --> UC_SALON_APPTS
    UC_ACCEPT --> UC_NOTIFY
    UC_REJECT --> UC_NOTIFY
    UC_NOTIFY --> UC_MY_APPTS
```

Proces pocinje prijavom korisnika, jer je zakazivanje termina omoguceno samo korisnickim nalozima. Nakon toga korisnik pretrazuje salone, otvara detalje izabranog salona, pregleda dostupne usluge i bira uslugu koju zeli da zakaze. Sistem zatim prikazuje dostupne termine za izabrani datum i uslugu. Kada korisnik izabere vreme i posalje zahtev, termin dobija status `Pending`. Salon u svom dashboard-u pregleda zahtev i moze da ga prihvati ili odbije, nakon cega korisnik vidi azuriran status rezervacije.
