Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$outDir = Join-Path $root "docs\images"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function New-Pen($color, $width = 2) {
    return New-Object System.Drawing.Pen ([System.Drawing.ColorTranslator]::FromHtml($color)), $width
}

function New-Brush($color) {
    return New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($color))
}

function Draw-CenteredText($g, $text, $font, $brush, $rect) {
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $g.DrawString($text, $font, $brush, $rect, $format)
}

function Draw-WrappedCenteredText($g, $text, $font, $brush, $rect) {
    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center
    $format.Trimming = [System.Drawing.StringTrimming]::Word
    $g.DrawString($text, $font, $brush, $rect, $format)
}

function Draw-Actor($g, $name, $x, $y, $font, $brush, $pen) {
    $head = New-Object System.Drawing.RectangleF ($x + 30), $y, 42, 42
    $g.DrawEllipse($pen, $head)
    $g.DrawLine($pen, ($x + 51), ($y + 42), ($x + 51), ($y + 112))
    $g.DrawLine($pen, ($x + 8), ($y + 68), ($x + 94), ($y + 68))
    $g.DrawLine($pen, ($x + 51), ($y + 112), ($x + 16), ($y + 166))
    $g.DrawLine($pen, ($x + 51), ($y + 112), ($x + 86), ($y + 166))

    $textRect = New-Object System.Drawing.RectangleF ($x - 20), ($y + 176), 145, 42
    Draw-CenteredText $g $name $font $brush $textRect
}

function Draw-UseCase($g, $label, $rect, $font, $textBrush, $fillBrush, $pen) {
    $g.FillEllipse($fillBrush, $rect)
    $g.DrawEllipse($pen, $rect)
    $inner = New-Object System.Drawing.RectangleF ($rect.X + 14), ($rect.Y + 10), ($rect.Width - 28), ($rect.Height - 20)
    Draw-WrappedCenteredText $g $label $font $textBrush $inner
}

function Draw-UseCaseDiagram($fileName, $title, $actorName, $useCases, $links, $notes = @()) {
    $width = 1900
    $height = 1260
    $bitmap = New-Object System.Drawing.Bitmap $width, $height
    $g = [System.Drawing.Graphics]::FromImage($bitmap)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    $bg = New-Brush "#fbf7fb"
    $systemFill = New-Brush "#ffffff"
    $caseFill = New-Brush "#f5e9f7"
    $textBrush = New-Brush "#27212b"
    $mutedBrush = New-Brush "#6f6475"
    $primaryPen = New-Pen "#7b3f8f" 3
    $borderPen = New-Pen "#dac9df" 2
    $linePen = New-Pen "#8c7a95" 2
    $includePen = New-Pen "#b173bf" 2
    $includePen.DashStyle = [System.Drawing.Drawing2D.DashStyle]::Dash

    $titleFont = New-Object System.Drawing.Font "Segoe UI", 30, ([System.Drawing.FontStyle]::Bold)
    $subtitleFont = New-Object System.Drawing.Font "Segoe UI", 13, ([System.Drawing.FontStyle]::Regular)
    $actorFont = New-Object System.Drawing.Font "Segoe UI", 15, ([System.Drawing.FontStyle]::Bold)
    $caseFont = New-Object System.Drawing.Font "Segoe UI", 13, ([System.Drawing.FontStyle]::Regular)
    $smallFont = New-Object System.Drawing.Font "Segoe UI", 10, ([System.Drawing.FontStyle]::Italic)

    $g.FillRectangle($bg, 0, 0, $width, $height)
    Draw-CenteredText $g $title $titleFont $textBrush (New-Object System.Drawing.RectangleF 0, 26, $width, 56)
    Draw-CenteredText $g "Salonify use-case dijagram" $subtitleFont $mutedBrush (New-Object System.Drawing.RectangleF 0, 82, $width, 28)

    $systemRect = New-Object System.Drawing.RectangleF 255, 135, 1585, 1010
    $g.FillRectangle($systemFill, $systemRect)
    $g.DrawRectangle($borderPen, $systemRect.X, $systemRect.Y, $systemRect.Width, $systemRect.Height)
    $g.DrawString("Salonify aplikacija", $actorFont, $textBrush, 285, 154)

    Draw-Actor $g $actorName 75 520 $actorFont $textBrush $primaryPen

    $caseRects = @{}
    $cols = 3
    $rows = [Math]::Ceiling($useCases.Count / $cols)
    $caseW = 390
    $caseH = 86
    $gapX = 105
    $gapY = if ($rows -gt 1) { [Math]::Min(82, [Math]::Floor((875 - ($rows * $caseH)) / ($rows - 1))) } else { 0 }
    $startX = 360
    $startY = 230

    for ($i = 0; $i -lt $useCases.Count; $i++) {
        $col = $i % $cols
        $row = [Math]::Floor($i / $cols)
        $x = $startX + ($col * ($caseW + $gapX))
        $y = $startY + ($row * ($caseH + $gapY))
        $rect = New-Object System.Drawing.RectangleF $x, $y, $caseW, $caseH
        $caseRects[$useCases[$i].Id] = $rect
    }

    foreach ($case in $useCases) {
        if ($case.Direct -eq $false) {
            continue
        }
        $rect = $caseRects[$case.Id]
        $g.DrawLine($linePen, 176, 690, $rect.X, ($rect.Y + ($rect.Height / 2)))
    }

    foreach ($link in $links) {
        $from = $caseRects[$link.From]
        $to = $caseRects[$link.To]
        if ($null -eq $from -or $null -eq $to) {
            continue
        }

        $x1 = $from.X + $from.Width
        $y1 = $from.Y + ($from.Height / 2)
        $x2 = $to.X
        $y2 = $to.Y + ($to.Height / 2)
        $g.DrawLine($includePen, $x1, $y1, $x2, $y2)

        $labelX = ($x1 + $x2) / 2 - 40
        $labelY = ($y1 + $y2) / 2 - 18
        $g.DrawString("ukljucuje", $smallFont, $mutedBrush, $labelX, $labelY)
    }

    foreach ($case in $useCases) {
        Draw-UseCase $g $case.Label $caseRects[$case.Id] $caseFont $textBrush $caseFill $primaryPen
    }

    if ($notes.Count -gt 0) {
        $noteText = [string]::Join("  |  ", $notes)
        $g.DrawString($noteText, $subtitleFont, $mutedBrush, 285, 1175)
    }

    $path = Join-Path $outDir $fileName
    $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bitmap.Dispose()
}

$userCases = @(
    @{ Id = "register"; Label = "Registruje nalog"; Direct = $true },
    @{ Id = "login"; Label = "Prijavljuje se"; Direct = $true },
    @{ Id = "profile"; Label = "Azurira kontakt podatke"; Direct = $true },
    @{ Id = "browse"; Label = "Pregleda salone"; Direct = $true },
    @{ Id = "search"; Label = "Pretrazuje i filtrira salone"; Direct = $true },
    @{ Id = "details"; Label = "Pregleda detalje salona"; Direct = $true },
    @{ Id = "services"; Label = "Pregleda usluge salona"; Direct = $true },
    @{ Id = "available"; Label = "Pregleda dostupne termine"; Direct = $true },
    @{ Id = "book"; Label = "Zakazuje termin"; Direct = $true },
    @{ Id = "myAppointments"; Label = "Pregleda svoje termine"; Direct = $true },
    @{ Id = "cancel"; Label = "Otkazuje termin"; Direct = $true },
    @{ Id = "review"; Label = "Ostavlja recenziju"; Direct = $true },
    @{ Id = "myReviews"; Label = "Pregleda svoje recenzije"; Direct = $true },
    @{ Id = "recommended"; Label = "Pregleda preporucene salone"; Direct = $true },
    @{ Id = "tracking"; Label = "Generise aktivnosti za preporuke"; Direct = $false }
)

$salonCases = @(
    @{ Id = "register"; Label = "Registruje salon nalog"; Direct = $true },
    @{ Id = "login"; Label = "Prijavljuje se"; Direct = $true },
    @{ Id = "dashboard"; Label = "Pregleda salon dashboard"; Direct = $true },
    @{ Id = "profile"; Label = "Azurira profil salona"; Direct = $true },
    @{ Id = "image"; Label = "Azurira naslovnu sliku"; Direct = $true },
    @{ Id = "working"; Label = "Uredjuje radne dane i radno vreme"; Direct = $true },
    @{ Id = "servicesView"; Label = "Pregleda svoje usluge"; Direct = $true },
    @{ Id = "serviceAdd"; Label = "Dodaje uslugu"; Direct = $true },
    @{ Id = "serviceEdit"; Label = "Menja uslugu"; Direct = $true },
    @{ Id = "serviceDelete"; Label = "Brise uslugu"; Direct = $true },
    @{ Id = "galleryAdd"; Label = "Dodaje slike u galeriju"; Direct = $true },
    @{ Id = "galleryDelete"; Label = "Brise slike iz galerije"; Direct = $true },
    @{ Id = "appointmentsView"; Label = "Pregleda termine salona"; Direct = $true },
    @{ Id = "accept"; Label = "Prihvata termin"; Direct = $true },
    @{ Id = "reject"; Label = "Odbija termin"; Direct = $true },
    @{ Id = "complete"; Label = "Oznacava termin kao zavrsen"; Direct = $true },
    @{ Id = "filter"; Label = "Filtrira termine po statusu"; Direct = $true },
    @{ Id = "reviews"; Label = "Pregleda recenzije"; Direct = $true },
    @{ Id = "featureVector"; Label = "Azurira feature vektor salona"; Direct = $false }
)

$adminCases = @(
    @{ Id = "login"; Label = "Prijavljuje se"; Direct = $true },
    @{ Id = "panel"; Label = "Pristupa admin panelu"; Direct = $true },
    @{ Id = "salons"; Label = "Pregleda salone"; Direct = $true },
    @{ Id = "reviews"; Label = "Pregleda recenzije"; Direct = $true },
    @{ Id = "deleteReview"; Label = "Brise recenziju"; Direct = $true },
    @{ Id = "refreshSalonVectors"; Label = "Osvezava vektore salona"; Direct = $true },
    @{ Id = "normalizeUserVectors"; Label = "Normalizuje korisnicke vektore"; Direct = $true },
    @{ Id = "recommendationsForUser"; Label = "Pregleda preporuke za korisnika"; Direct = $true },
    @{ Id = "userData"; Label = "Pregleda korisnicke podatke"; Direct = $true },
    @{ Id = "activity"; Label = "Evidentira pregled salona/usluge"; Direct = $true }
)

$overviewCases = @(
    @{ Id = "auth"; Label = "Registracija i prijava"; Direct = $true },
    @{ Id = "search"; Label = "Pretraga i pregled salona"; Direct = $true },
    @{ Id = "booking"; Label = "Zakazivanje termina"; Direct = $true },
    @{ Id = "reviews"; Label = "Recenzije"; Direct = $true },
    @{ Id = "salonMgmt"; Label = "Upravljanje salonom"; Direct = $true },
    @{ Id = "appointmentMgmt"; Label = "Upravljanje terminima"; Direct = $true },
    @{ Id = "recommendations"; Label = "Sistem preporuka"; Direct = $true },
    @{ Id = "adminMgmt"; Label = "Administracija sistema"; Direct = $true }
)

Draw-UseCaseDiagram "use-case-korisnik.png" "Use-case dijagram - Korisnik" "Korisnik" $userCases @(
    @{ From = "search"; To = "tracking" },
    @{ From = "details"; To = "tracking" },
    @{ From = "services"; To = "tracking" },
    @{ From = "book"; To = "tracking" }
) @("Aktivnosti korisnika pune PreferenceVector", "Preporuke se racunaju content-based filtering pristupom")

Draw-UseCaseDiagram "use-case-salon.png" "Use-case dijagram - Salon" "Salon" $salonCases @(
    @{ From = "serviceAdd"; To = "featureVector" },
    @{ From = "serviceEdit"; To = "featureVector" },
    @{ From = "serviceDelete"; To = "featureVector" }
) @("Promena usluga ponovo racuna FeatureVector salona")

Draw-UseCaseDiagram "use-case-admin.png" "Use-case dijagram - Admin" "Admin" $adminCases @() @(
    "Admin odrzava sistem preporuka i moderira recenzije"
)

Draw-UseCaseDiagram "use-case-pregled-sistema.png" "Use-case dijagram - Pregled sistema" "Uloge" $overviewCases @() @(
    "Zajednicki pregled glavnih funkcionalnih oblasti aplikacije"
)

Write-Host "Use-case slike su generisane u: $outDir"
