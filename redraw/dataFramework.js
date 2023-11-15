export var dataFiles = {
  ageAndSex: {
    name: 'age_and_sex',
    filePath: "ACS_14_5YR/age_and_sex_data.csv",
    statistics: {
      totalPopulation: 'HC01_EST_VC01',
      medianAge: 'HC01_EST_VC35',
      ageDependencyRatio: 'HC01_EST_VC37'
    },
    data: []
  },
  education: {
    name: 'education',
    filePath: "ACS_14_5YR/education_data.csv",
    statistics: {
      percentHSGradOrHigher: 'HC01_EST_VC16',
      percentBachelorsOrHigher: 'HC01_EST_VC17'
    },
    data: []
  },
  employment: {
    name: 'employment',
    filePath: "ACS_14_5YR/employment_data.csv",
    statistics: {},
    data: []
  },
  income: {
    name: 'income',
    filePath: "ACS_14_5YR/income_data.csv",
    statistics: {
      medianIncome: 'HC01_EST_VC13',
      meanIncome: 'HC01_EST_VC15'
    },
    data: []
  },
  language: {
    name: 'language',
    filePath: "ACS_14_5YR/language_data.csv",
    statistics: {},
    data: []
  },
  maritalStatus: {
    name: 'marital_status',
    filePath: "ACS_14_5YR/marital_status_data.csv",
    statistics: {},
    data: []
  },
  race: {
    name: 'race',
    filePath: "ACS_14_5YR/race_data.csv",
    statistics: {
      white: 'HD01_VD02',
      black: 'HD01_VD03',
      nativeAmerican: 'HD01_VD04',
      asian: 'HD01_VD05',
      pacificIslander: 'HD01_VD06',
      other: 'HD01_VD07',
      mixed: 'HD01_VD08'
    },
    data: []
  },
  schoolEnrollment: {
    name: 'school_enrollment',
    filePath: "ACS_14_5YR/school_enrollment_data.csv",
    statistics: {},
    data: []
  },
  politics: {
    name: 'politics',
    filePath: "us16.12.csv",
    statistics: {
      votesDem2016: 'votes_dem_2016',
      votesGop2016: 'votes_gop_2016',
      votes2016: 'total_votes_2016',
      percentDem2016: 'per_dem_2016',
      percentGop2016: 'per_gop_2016',
      percentDiff2016: 'per_point_diff_2016',
      votesDem2012: 'votes_dem_2012',
      votesGop2012: 'votes_gop_2012',
      votes2012: 'total_votes_2012',
      percentDem2012: 'per_dem_2012',
      percentGop2012: 'per_gop_2012',
      percentDiff2012: 'per_point_diff_2012'
    },
    data: []
  }
}
