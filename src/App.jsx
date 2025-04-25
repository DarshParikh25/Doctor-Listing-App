import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const App = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtySearch, setSpecialtySearch] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [sortOrder, setSortOrder] = useState("asc"); // Ascending or Descending for sorting
  const [mode, setMode] = useState(""); // Video or In-Clinic

  // Fetch data from the API
  useEffect(() => {
    fetch("https://srijandubey.github.io/campus-api-mock/SRM-C1-25.json")
      .then((res) => res.json())
      .then((data) => {
        setDoctors(data);
        setFilteredDoctors(data);
      });
  }, []);

  // Update filtered doctors when search parameters change
  useEffect(() => {
    const term = searchParams.get("search") || "";
    const mode = searchParams.get("mode") || "";
    const specialties = searchParams.get("specialties")?.split(",") || [];
    const sort = searchParams.get("sort") || "";

    let filtered = [...doctors];

    // Search filter by doctor name
    if (term) {
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(term.toLowerCase())
      );
    }

    // Filter by mode (video or in-clinic)
    if (mode) {
      filtered = filtered.filter((doc) => doc.mode === mode);
    }

    // Filter by selected specialties
    if (specialties.length > 0) {
      filtered = filtered.filter((doc) =>
        specialties.every((s) => doc.specialties?.includes(s))
      );
    }

    // Sorting
    if (sort === "fees") {
      filtered.sort((a, b) => (sortOrder === "asc" ? a.fees - b.fees : b.fees - a.fees));
    } else if (sort === "experience") {
      filtered.sort((a, b) => (sortOrder === "asc" ? a.experience - b.experience : b.experience - a.experience));
    }

    setFilteredDoctors(filtered);
  }, [searchParams, doctors, sortOrder]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearchParams((prev) => ({
      ...Object.fromEntries(prev.entries()),
      search: value,
    }));
  };

  // Generate all specialties (unique)
  const allSpecialties = Array.from(
    new Set(doctors.flatMap((doc) => doc.specialties || []))
  );

  // Filter specialties based on the search input
  const filteredSpecialties = allSpecialties.filter((spec) =>
    spec.toLowerCase().includes(specialtySearch.toLowerCase())
  );

  // Handle specialty toggle (for filters)
  const toggleSpecialty = (spec) => {
    let updated = selectedSpecialties.includes(spec)
      ? selectedSpecialties.filter((s) => s !== spec)
      : [...selectedSpecialties, spec];

    setSelectedSpecialties(updated);
    setSearchParams((prev) => ({
      ...Object.fromEntries(prev.entries()),
      specialties: updated.join(","),
    }));
  };

  const handleModeChange = (modeType) => {
    setMode(modeType);
    setSearchParams((prev) => ({
      ...Object.fromEntries(prev.entries()),
      mode: modeType,
    }));
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="w-full bg-blue-800 py-4 px-6 fixed top-0 left-0 z-50 flex justify-center shadow-md">
        <div className="flex items-center bg-white border border-gray-300 w-full max-w-5xl rounded-md overflow-hidden">
          <input
            type="search"
            name="search"
            placeholder="Search Symptoms, Doctors, Specialists, Clinics"
            className="flex-grow px-4 py-2 outline-none"
            value={searchTerm}
            onChange={handleSearchChange}
            data-testid="autocomplete-input"
          />
          <button className="px-4 text-blue-600 font-medium hover:underline">
            🔍
          </button>
        </div>
      </nav>

      {/* Content Layout */}
      <div className="flex pt-24 px-6 gap-6 bg-gray-100">
        {/* Sidebar */}
        <aside className="w-1/4 sticky top-24 self-start bg-white rounded-md shadow-sm p-4 h-fit">
          <h2 className="text-md font-semibold mb-4">Sort by</h2>
          <form className="flex flex-col gap-3 mb-6">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="sort"
                id="sort-fees"
                onChange={() =>
                  setSearchParams((prev) => ({
                    ...Object.fromEntries(prev.entries()),
                    sort: "fees",
                  }))
                }
              />
              Price: Low - High
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="sort"
                id="sort-experience"
                onChange={() =>
                  setSearchParams((prev) => ({
                    ...Object.fromEntries(prev.entries()),
                    sort: "experience",
                  }))
                }
              />
              Experience - Most Experienced First
            </label>
          </form>

          <div>
            <h2 className="text-md font-semibold mb-2">Filters</h2>
            <p
              className="text-blue-500 text-sm mb-2 cursor-pointer"
              onClick={() => {
                setSearchParams({});
                setSelectedSpecialties([]);
                setSpecialtySearch("");
                setSearchTerm("");
              }}
            >
              Clear All
            </p>

            <div className="mb-4">
              <h3 className="font-medium text-sm mb-2">Specialities</h3>
              <input
                type="text"
                placeholder="Search Specialities"
                className="w-full px-2 py-1 border rounded mb-2 text-sm"
                value={specialtySearch}
                onChange={(e) => setSpecialtySearch(e.target.value)}
              />
              <div className="max-h-48 overflow-y-auto pr-2">
                {filteredSpecialties.map((spec) => (
                  <label key={spec} className="block text-sm">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedSpecialties.includes(spec)}
                      onChange={() => toggleSpecialty(spec)}
                    />
                    {spec}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm mb-2">Mode of consultation</h3>
              <label className="block text-sm">
                <input
                  type="radio"
                  name="mode"
                  className="mr-2"
                  onChange={() => handleModeChange("video")}
                />
                Video Consultation
              </label>
              <label className="block text-sm">
                <input
                  type="radio"
                  name="mode"
                  className="mr-2"
                  onChange={() => handleModeChange("in-clinic")}
                />
                In-clinic Consultation
              </label>
              <label className="block text-sm">
                <input
                  type="radio"
                  name="mode"
                  className="mr-2"
                  onChange={() => handleModeChange("")}
                />
                All
              </label>
            </div>
          </div>
        </aside>

        {/* Doctor Cards */}
        <section className="flex-grow">
          {filteredDoctors.map((doctor, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-xl shadow-sm mb-4 flex items-center justify-between"
            >
              <div className="flex gap-4">
                <img src={doctor.photo} className="rounded-xl" alt="" />
                <div>
                  <h3 className="text-lg font-bold">{doctor.name}</h3>
                  <p className="text-sm text-gray-600">{(doctor.specialities)[0].name}</p>
                  <p className="text-sm">{doctor.experience} years of experience</p>
                  <p className="text-sm text-gray-700">{doctor.clinic.address.locality}, {doctor.clinic.address.city}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">{doctor.fees}</p>
                <button className="mt-2 border border-blue-500 px-4 py-1 rounded text-blue-600 hover:bg-blue-50">
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default App;
