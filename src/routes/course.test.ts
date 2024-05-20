import { test } from 'tap';
import { build } from '../app';

const app = build();

test('Testing getAllCourses on /course', async (t) => {
    const response = await app.inject({
        method: 'GET',
        url: '/courses'
    });
    t.equal(response.statusCode, 200, 'GET all courses should return status code 200');
    
    app.end();
});

let courseId: string = '';

test('Testing postNewCourse on /course', async (t) => {
    const newCourse = { 
        name: 'New course',
        provedor: 'New course provider',
        category: 'New course category',
        duration: 10,
        verifyUrl: 'https://example.com/verify'
    };
    const postNewCourseResponse = await app.inject({
        method: 'POST',
        url: '/courses',
        body: newCourse
    });
    t.equal(postNewCourseResponse.statusCode, 201, 'POST new course should return status code 201');

    courseId = postNewCourseResponse.body.id;
});

console.log(courseId);

// // GET the new course
// const getNewCourseResponse = await app.inject({
//     method: 'GET',
//     url: `/courses/${courseId}`
// })
// t.equal(getNewCourseResponse.statusCode, 200, 'GET new course should return status code 200');

// // PATCH one attribute of the new course
// const updatedCourse = { provedor: 'PATCH provedor' };
// const patchCourseResponse = await app.inject({
//     method: 'PATCH',
//     url: `/courses/${courseId}`,
//     body: updatedCourse
// })
// t.equal(patchCourseResponse.statusCode, 200, 'PATCH course should return status code 200');

// const retestNewCourseResponse = await app.inject({
//     method: 'GET',
//     url: `/courses/${courseId}`
// })
// t.equal(retestNewCourseResponse.statusCode, 200, 'GET new course should return status code 200');

// // DELETE the new course
// const deleteCourseResponse = await app.inject({
//     method: 'DELETE',
//     url: `/courses/${courseId}`
// })
// t.equal(deleteCourseResponse.statusCode, 204, 'DELETE course should return status code 204');
