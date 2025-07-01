const { generateToken } = require('../../util/token');
const { checkPassword } = require('../../util/password');
const path = require('path');
const { getCurrentDate } = require('../../util/date');
const dotenv = require('dotenv').config({});

module.exports = function HomeScreenService({ userModel, schoolModel, projectModel, dashboardModel, courseModel, CustomError, env }) {
    return function handle(httpRequest) {
        const { method } = httpRequest;
        switch (method) {
            case 'POST':
                return postLogin(httpRequest);
            default:
                const error = CustomError({ message: 'Method not allowed.', status: 405 });
                return error.handle();
        }
    }

    async function postLogin(httpRequest) {
        try {
            const { vt_id } = httpRequest.body;
            const allocated_school = await schoolModel.getAllocatedSchool({ vt_id });
            if (!allocated_school) {
                return {
                    status: 200, data: {
                        status: false, message: 'You are not allocated to any active school.'
                    }
                };
            }
            const project_details = await projectModel.getProjectDetails({ allocated_school });
            const trade = project_details.Trade;
            const school = project_details.School;
            const batches = await dashboardModel.getBatchesCount({ school, trade });
            const students = await dashboardModel.getStudentsCount({ school, trade });
            const hsti = await dashboardModel.getHstiCount({ allocated_school });
            const gl = await dashboardModel.getGlCount({ allocated_school });

            const { Project: project_id, Trade: trade_id, Job_Role: job_role_id, School: school_id } = project_details;

            const project = await schoolModel.getProjectDetails({ project_id });

            const trade1 = await schoolModel.getTradeDetails({ trade_id });
            const job_role = await schoolModel.getJobRoleDetails({ job_role_id });
            const school1 = await schoolModel.getSchoolDetails({ school_id });
            const profile = await schoolModel.getProfile({ vt_id });

            const jobRoles = project_details.Job_Role.split(',');
            const courseMaterials = await courseModel.getCourseMaterials({ trade, jobRoles });
            const current_date=getCurrentDate();
            console.log(current_date);
            const notify=await dashboardModel.getEventNotifications({project_id,current_date})

            let course_material = 0;
            for (const material of courseMaterials) {
                const materialsDetails = await courseModel.getMaterialDetails({ courseMaterialId: material.ID });
                course_material += materialsDetails.length;
            }
            return {
                status: 200,
                data: {
                    status: true,
                    version:"4.1.1",
                    dashboard_data: {
                        batches,
                        students,
                        hsti,
                        gl,
                        course_material
                    },
                    school_information: {
                        project: project,
                        trade: trade1,
                        job_role: job_role,
                        school: school1,
                        profile: profile
                    },
                    notifications:notify
                }
            }

        } catch (err) {
            const error = CustomError(err);
            return error.handle();
        }
    }
}