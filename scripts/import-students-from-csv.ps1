param(
  [string]$CsvPath = "",
  [string]$EnvPath = ".env.local",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Read-DotEnv($path) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Missing env file: $path"
  }

  $values = @{}
  Get-Content -LiteralPath $path -Encoding UTF8 | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) { return }
    $parts = $line -split "=", 2
    if ($parts.Count -ne 2) { return }
    $values[$parts[0].Trim()] = $parts[1].Trim().Trim('"').Trim("'")
  }
  return $values
}

function Invoke-Supabase($Method, $Path, $Body = $null) {
  $headers = @{
    "apikey"        = $script:ApiKey
    "Authorization" = "Bearer $script:AuthToken"
    "Content-Type"  = "application/json; charset=utf-8"
    "Prefer"        = "return=representation"
  }

  $uri = "$script:SupabaseUrl/rest/v1/$Path"
  if ($null -eq $Body) {
    return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers
  }

  $json = $Body | ConvertTo-Json -Depth 8 -Compress
  return Invoke-RestMethod -Method $Method -Uri $uri -Headers $headers -Body $json
}

function Convert-SubjectName($value) {
  switch -Regex ($value) {
    "^Math$" { return "MATH" }
    "^Thai Reading$" { return "THAI" }
    "^English EFL$" { return "ENG" }
    default { throw "Unknown subject: $value" }
  }
}

function Convert-GradeLevel($value) {
  switch ($value) {
    "PK1" { return "อ.1" }
    "PK2" { return "อ.2" }
    "PK3" { return "อ.3" }
    "1" { return "ป.1" }
    "2" { return "ป.2" }
    "3" { return "ป.3" }
    "4" { return "ป.4" }
    "5" { return "ป.5" }
    "6" { return "ป.6" }
    "7" { return "ม.1" }
    "8" { return "ม.2" }
    "9" { return "ม.3" }
    "10" { return "ม.4" }
    "11" { return "ม.5" }
    "12" { return "ม.6" }
    default { return $value }
  }
}

function To-StudentMap($rows) {
  $studentsByName = [ordered]@{}

  foreach ($row in $rows) {
    $firstName = ""
    if ($null -ne $row.Column3) { $firstName = $row.Column3.Trim() }
    $lastName = ""
    if ($null -ne $row.Column4) { $lastName = $row.Column4.Trim() }
    $fullName = "$firstName $lastName".Trim()
    if (-not $fullName) { continue }

    $subjectName = Convert-SubjectName $row.Column1
    $rawGradeLevel = ""
    if ($null -ne $row.Column6) { $rawGradeLevel = $row.Column6.Trim() }
    $gradeLevel = Convert-GradeLevel $rawGradeLevel

    if (-not $studentsByName.Contains($fullName)) {
      $studentsByName[$fullName] = [ordered]@{
        name = $fullName
        nickname = $null
        grade_level = if ($gradeLevel) { $gradeLevel } else { $null }
        subjects = [ordered]@{}
      }
    }

    if ($gradeLevel -and -not $studentsByName[$fullName].grade_level) {
      $studentsByName[$fullName].grade_level = $gradeLevel
    }
    $studentsByName[$fullName].subjects[$subjectName] = $true
  }

  return $studentsByName
}

$envValues = Read-DotEnv $EnvPath
$script:SupabaseUrl = ""
if ($envValues.ContainsKey("SUPABASE_URL")) {
  $script:SupabaseUrl = $envValues["SUPABASE_URL"].TrimEnd("/")
}
$script:ApiKey = $envValues["SUPABASE_ANON_KEY"]
$script:AuthToken = $envValues["SUPABASE_SERVICE_ROLE_KEY"]
if (-not $script:AuthToken) {
  $script:AuthToken = $script:ApiKey
}

if (-not $script:SupabaseUrl -or -not $script:ApiKey) {
  throw "Missing SUPABASE_URL or Supabase key in $EnvPath"
}

$authEmail = $envValues["SUPABASE_AUTH_EMAIL"]
$authPassword = $envValues["SUPABASE_AUTH_PASSWORD"]
if (-not $envValues["SUPABASE_SERVICE_ROLE_KEY"] -and $authEmail -and $authPassword) {
  $loginHeaders = @{
    "apikey" = $script:ApiKey
    "Content-Type" = "application/json; charset=utf-8"
  }
  $loginBody = @{
    email = $authEmail
    password = $authPassword
  } | ConvertTo-Json -Compress
  $loginUri = "$script:SupabaseUrl/auth/v1/token?grant_type=password"
  $loginResult = Invoke-RestMethod -Method POST -Uri $loginUri -Headers $loginHeaders -Body $loginBody
  $script:AuthToken = $loginResult.access_token
}

if (-not $CsvPath) {
  $csvFiles = @(Get-ChildItem -File -Filter "*.csv")
  if ($csvFiles.Count -eq 0) {
    throw "No CSV file found in the current directory."
  }
  if ($csvFiles.Count -gt 1) {
    throw "More than one CSV file found. Pass -CsvPath explicitly."
  }
  $CsvPath = $csvFiles[0].FullName
}

$rows = Import-Csv -LiteralPath $CsvPath -Encoding Default
$studentsByName = To-StudentMap $rows

$subjectNames = @("MATH", "THAI", "ENG")
$studentCount = $studentsByName.Count
$relationCount = 0
foreach ($student in $studentsByName.Values) {
  $relationCount += $student.subjects.Count
}

Write-Host "CSV rows: $($rows.Count)"
Write-Host "Unique students: $studentCount"
Write-Host "Student-subject links: $relationCount"

if ($DryRun) {
  Write-Host "Dry run only. No Supabase changes were made."
  exit 0
}

$subjects = Invoke-Supabase "GET" "subjects?select=id,name"
$subjectsByName = @{}
foreach ($subject in $subjects) {
  $subjectsByName[$subject.name.ToUpperInvariant()] = $subject
}

$subjectColors = @{
  "MATH" = "red"
  "THAI" = "green"
  "ENG" = "blue"
}

foreach ($name in $subjectNames) {
  if (-not $subjectsByName.ContainsKey($name)) {
    $created = Invoke-Supabase "POST" "subjects" @{
      name = $name
      color = $subjectColors[$name]
    }
    $subjectsByName[$name] = $created[0]
  }
}

$existingStudents = Invoke-Supabase "GET" "students?select=id,name,nickname,grade_level,qr_code,is_active"
$existingByName = @{}
foreach ($student in $existingStudents) {
  if (-not $existingByName.ContainsKey($student.name)) {
    $existingByName[$student.name] = $student
  }
}

$createdStudents = 0
$updatedStudents = 0
$studentsForLinks = @{}

foreach ($student in $studentsByName.Values) {
  if ($existingByName.ContainsKey($student.name)) {
    $existing = $existingByName[$student.name]
    $needsUpdate = (-not $existing.is_active) -or ($existing.grade_level -ne $student.grade_level)
    if ($needsUpdate) {
      $encodedId = [uri]::EscapeDataString($existing.id)
      $updated = Invoke-Supabase "PATCH" "students?id=eq.$encodedId" @{
        grade_level = $student.grade_level
        is_active = $true
      }
      $studentsForLinks[$student.name] = $updated[0]
      $updatedStudents++
    } else {
      $studentsForLinks[$student.name] = $existing
    }
  } else {
    $created = Invoke-Supabase "POST" "students" @{
      name = $student.name
      nickname = $student.nickname
      grade_level = $student.grade_level
      qr_code = [guid]::NewGuid().ToString()
      is_active = $true
    }
    $studentsForLinks[$student.name] = $created[0]
    $createdStudents++
  }
}

$existingLinks = Invoke-Supabase "GET" "student_subjects?select=student_id,subject_id"
$linkKeys = @{}
foreach ($link in $existingLinks) {
  $linkKeys["$($link.student_id)|$($link.subject_id)"] = $true
}

$linksToCreate = @()
foreach ($student in $studentsByName.Values) {
  $studentRow = $studentsForLinks[$student.name]
  foreach ($subjectName in $student.subjects.Keys) {
    $subjectId = $subjectsByName[$subjectName].id
    $key = "$($studentRow.id)|$subjectId"
    if (-not $linkKeys.ContainsKey($key)) {
      $linksToCreate += @{
        student_id = $studentRow.id
        subject_id = $subjectId
      }
      $linkKeys[$key] = $true
    }
  }
}

if ($linksToCreate.Count -gt 0) {
  [void](Invoke-Supabase "POST" "student_subjects" $linksToCreate)
}

Write-Host "Created students: $createdStudents"
Write-Host "Updated/reactivated students: $updatedStudents"
Write-Host "Created student-subject links: $($linksToCreate.Count)"
Write-Host "Import complete."
